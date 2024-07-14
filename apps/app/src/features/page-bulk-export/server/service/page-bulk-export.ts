import fs from 'fs';
import path from 'path';
import type { Readable } from 'stream';
import { Writable, pipeline } from 'stream';
import { pipeline as pipelinePromise } from 'stream/promises';


import type { HasObjectId } from '@growi/core';
import { type IPage, isPopulated, SubscriptionStatusType } from '@growi/core';
import { getParentPath, normalizePath } from '@growi/core/dist/utils/path-utils';
import type { Archiver } from 'archiver';
import archiver from 'archiver';
import gc from 'expose-gc/function';
import mongoose from 'mongoose';
import streamToPromise from 'stream-to-promise';

import type { SupportedActionType } from '~/interfaces/activity';
import { SupportedAction, SupportedTargetModel } from '~/interfaces/activity';
import { AttachmentType, FilePathOnStoragePrefix } from '~/server/interfaces/attachment';
import type { IAttachmentDocument } from '~/server/models';
import { Attachment } from '~/server/models';
import type { ActivityDocument } from '~/server/models/activity';
import type { PageModel, PageDocument } from '~/server/models/page';
import Subscription from '~/server/models/subscription';
import type { FileUploader } from '~/server/service/file-uploader';
import type { IMultipartUploader } from '~/server/service/file-uploader/multipart-uploader';
import { preNotifyService } from '~/server/service/pre-notify';
import { getBufferToFixedSizeTransform } from '~/server/util/stream';
import loggerFactory from '~/utils/logger';

import { PageBulkExportFormat } from '../../interfaces/page-bulk-export';
import type { PageBulkExportJobDocument } from '../models/page-bulk-export-job';
import PageBulkExportJob from '../models/page-bulk-export-job';
import PageBulkExportPageSnapshot from '../models/page-bulk-export-page-snapshot';


const logger = loggerFactory('growi:services:PageBulkExportService');

type ActivityParameters ={
  ip: string | undefined;
  endpoint: string;
}

class PageBulkExportService {

  crowi: any;

  activityEvent: any;

  // multipart upload max part size
  maxPartSize = 5 * 1024 * 1024; // 5MB

  pageBatchSize = 100;

  compressExtension = 'tar.gz';

  // temporal path of local fs to output page files before upload
  // TODO: If necessary, change to a proper path in https://redmine.weseek.co.jp/issues/149512
  tmpOutputRootDir = '/tmp';

  constructor(crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');
  }

  async createAndStartPageBulkExportJob(basePagePath: string, currentUser, activityParameters: ActivityParameters): Promise<void> {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const basePage = await Page.findByPathAndViewer(basePagePath, currentUser, null, true);

    if (basePage == null) {
      throw new Error('Base page not found or not accessible');
    }

    const pageBulkExportJob: PageBulkExportJobDocument & HasObjectId = await PageBulkExportJob.create({
      user: currentUser,
      page: basePage,
      format: PageBulkExportFormat.markdown,
    });

    await Subscription.upsertSubscription(currentUser, SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB, pageBulkExportJob, SubscriptionStatusType.SUBSCRIBE);
    await this.createPageSnapshots(basePagePath, currentUser, pageBulkExportJob);

    this.bulkExportWithBasePagePath(basePagePath, currentUser, activityParameters, pageBulkExportJob);
  }

  async bulkExportWithBasePagePath(
      basePagePath: string, currentUser, activityParameters: ActivityParameters, pageBulkExportJob: PageBulkExportJobDocument & HasObjectId,
  ): Promise<void> {
    const timeStamp = (new Date()).getTime();
    const exportName = `page-bulk-export-${timeStamp}`;

    // export pages to fs temporarily
    const tmpOutputDir = `${this.tmpOutputRootDir}/${exportName}`;
    try {
      await this.exportPagesToFS(basePagePath, tmpOutputDir, currentUser);
    }
    catch (err) {
      await this.handleExportError(err, activityParameters, pageBulkExportJob, tmpOutputDir);
      return;
    }

    const pageArchiver = this.setUpPageArchiver();
    const bufferToPartSizeTransform = getBufferToFixedSizeTransform(this.maxPartSize);

    const originalName = `${exportName}.${this.compressExtension}`;
    const attachment = Attachment.createWithoutSave(null, currentUser, originalName, this.compressExtension, 0, AttachmentType.PAGE_BULK_EXPORT);
    const uploadKey = `${FilePathOnStoragePrefix.pageBulkExport}/${attachment.fileName}`;

    // init multipart upload
    const fileUploadService: FileUploader = this.crowi.fileUploadService;
    const multipartUploader: IMultipartUploader = fileUploadService.createMultipartUploader(uploadKey, this.maxPartSize);
    try {
      await multipartUploader.initUpload();
      pageBulkExportJob.uploadId = multipartUploader.uploadId;
      await pageBulkExportJob.save;
    }
    catch (err) {
      await this.handleExportError(err, activityParameters, pageBulkExportJob, tmpOutputDir, multipartUploader);
      return;
    }

    const multipartUploadWritable = this.getMultipartUploadWritable(multipartUploader, pageBulkExportJob, attachment, activityParameters, tmpOutputDir);

    pipeline(pageArchiver, bufferToPartSizeTransform, multipartUploadWritable,
      err => this.handleExportError(err, activityParameters, pageBulkExportJob, tmpOutputDir, multipartUploader));
    pageArchiver.directory(tmpOutputDir, false);
    pageArchiver.finalize();
  }

  /**
   * Handles export failure with the following:
   * - notify the user of the failure
   * - remove the temporal output directory
   * - abort multipart upload
   */
  // TODO: update completedAt of pageBulkExportJob, or add a failed status flag to it (https://redmine.weseek.co.jp/issues/78040)
  private async handleExportError(
      err: Error | null,
      activityParameters: ActivityParameters,
      pageBulkExportJob: PageBulkExportJobDocument,
      tmpOutputDir: string,
      multipartUploader?: IMultipartUploader,
  ): Promise<void> {
    if (err != null) {
      logger.error(err);

      const results = await Promise.allSettled([
        this.notifyExportResult(activityParameters, pageBulkExportJob, SupportedAction.ACTION_PAGE_BULK_EXPORT_FAILED),
        fs.promises.rm(tmpOutputDir, { recursive: true, force: true }),
        multipartUploader?.abortUpload(),
      ]);
      results.forEach((result) => {
        if (result.status === 'rejected') logger.error(result.reason);
      });
    }
  }

  private async exportPagesToFS(basePagePath: string, outputDir: string, currentUser): Promise<void> {
    const pagesReadable = await this.getPageReadable(basePagePath, currentUser, true);
    const pagesWritable = this.getPageWritable(outputDir);

    return pipelinePromise(pagesReadable, pagesWritable);
  }

  /**
   * Get a Readable of all the pages under the specified path, including the root page.
   */
  private async getPageReadable(basePagePath: string, currentUser, populateRevision = false): Promise<Readable> {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const { PageQueryBuilder } = Page;

    const builder = await new PageQueryBuilder(Page.find())
      .addConditionToListWithDescendants(basePagePath)
      .addViewerCondition(currentUser);

    if (populateRevision) {
      builder.query = builder.query.populate('revision');
    }

    return builder
      .query
      .lean()
      .cursor({ batchSize: this.pageBatchSize });
  }

  private async createPageSnapshots(basePagePath: string, currentUser, pageBulkExportJob: PageBulkExportJobDocument) {
    const pagesReadable = await this.getPageReadable(basePagePath, currentUser);
    const pageSnapshotwritable = new Writable({
      objectMode: true,
      write: async(page: PageDocument, encoding, callback) => {
        try {
          await PageBulkExportPageSnapshot.create({
            pageBulkExportJob: pageBulkExportJob._id,
            path: page.path,
            revision: page.revision,
          });
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
    });
    pagesReadable.pipe(pageSnapshotwritable);
    await streamToPromise(pageSnapshotwritable);
  }

  /**
   * Get a Writable that writes the page body temporarily to fs
   */
  private getPageWritable(outputDir: string): Writable {
    return new Writable({
      objectMode: true,
      write: async(page: PageDocument, encoding, callback) => {
        try {
          const revision = page.revision;

          if (revision != null && isPopulated(revision)) {
            const markdownBody = revision.body;
            const pathNormalized = `${normalizePath(page.path)}.md`;
            const fileOutputPath = path.join(outputDir, pathNormalized);
            const fileOutputParentPath = getParentPath(fileOutputPath);

            await fs.promises.mkdir(fileOutputParentPath, { recursive: true });
            await fs.promises.writeFile(fileOutputPath, markdownBody);
          }
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
    });
  }

  private setUpPageArchiver(): Archiver {
    const pageArchiver = archiver('tar', {
      gzip: true,
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    pageArchiver.on('warning', (err) => {
      if (err.code === 'ENOENT') logger.error(err);
      else throw err;
    });

    return pageArchiver;
  }

  private getMultipartUploadWritable(
      multipartUploader: IMultipartUploader,
      pageBulkExportJob: PageBulkExportJobDocument,
      attachment: IAttachmentDocument,
      activityParameters: ActivityParameters,
      tmpOutputDir: string,
  ): Writable {
    let partNumber = 1;

    return new Writable({
      write: async(part: Buffer, encoding, callback) => {
        try {
          await multipartUploader.uploadPart(part, partNumber);
          partNumber += 1;
          // First aid to prevent unexplained memory leaks
          logger.info('global.gc() invoked.');
          gc();
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
      final: async(callback) => {
        try {
          await multipartUploader.completeUpload();

          const fileSize = await multipartUploader.getUploadedFileSize();
          attachment.fileSize = fileSize;
          await attachment.save();

          pageBulkExportJob.completedAt = new Date();
          pageBulkExportJob.attachment = attachment._id;
          await pageBulkExportJob.save();

          await this.notifyExportResult(activityParameters, pageBulkExportJob, SupportedAction.ACTION_PAGE_BULK_EXPORT_COMPLETED);
          await fs.promises.rm(tmpOutputDir, { recursive: true, force: true });
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
    });
  }

  private async notifyExportResult(
      activityParameters: ActivityParameters, pageBulkExportJob: PageBulkExportJobDocument, action: SupportedActionType,
  ) {
    const activity = await this.crowi.activityService.createActivity({
      ...activityParameters,
      action,
      targetModel: SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB,
      target: pageBulkExportJob,
      user: pageBulkExportJob.user,
      snapshot: {
        username: isPopulated(pageBulkExportJob.user) ? pageBulkExportJob.user.username : '',
      },
    });
    const getAdditionalTargetUsers = (activity: ActivityDocument) => [activity.user];
    const preNotify = preNotifyService.generatePreNotify(activity, getAdditionalTargetUsers);
    this.activityEvent.emit('updated', activity, pageBulkExportJob, preNotify);
  }

}

// eslint-disable-next-line import/no-mutable-exports
export let pageBulkExportService: PageBulkExportService | undefined; // singleton instance
export default function instanciate(crowi): void {
  pageBulkExportService = new PageBulkExportService(crowi);
}
