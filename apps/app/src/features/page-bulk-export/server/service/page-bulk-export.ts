import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import { pipeline as pipelinePromise } from 'stream/promises';


import type { HasObjectId } from '@growi/core';
import { type IPage, isPopulated, SubscriptionStatusType } from '@growi/core';
import { getParentPath, normalizePath } from '@growi/core/dist/utils/path-utils';
import type { Archiver } from 'archiver';
import archiver from 'archiver';
import gc from 'expose-gc/function';
import mongoose from 'mongoose';

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

import { PageBulkExportFormat, PageBulkExportJobStatus } from '../../interfaces/page-bulk-export';
import type { PageBulkExportJobDocument } from '../models/page-bulk-export-job';
import PageBulkExportJob from '../models/page-bulk-export-job';
import type { PageBulkExportPageSnapshotDocument } from '../models/page-bulk-export-page-snapshot';
import PageBulkExportPageSnapshot from '../models/page-bulk-export-page-snapshot';


const logger = loggerFactory('growi:services:PageBulkExportService');

type ActivityParameters ={
  ip: string | undefined;
  endpoint: string;
}

export class DuplicateBulkExportJobError extends Error {

  constructor() {
    super('Duplicate bulk export job is in progress');
  }

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

  pageModel: PageModel;

  constructor(crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');
    this.pageModel = mongoose.model<IPage, PageModel>('Page');
  }

  async createAndStartPageBulkExportJob(basePagePath: string, currentUser, activityParameters: ActivityParameters): Promise<void> {
    const basePage = await this.pageModel.findByPathAndViewer(basePagePath, currentUser, null, true);

    if (basePage == null) {
      throw new Error('Base page not found or not accessible');
    }

    const format = PageBulkExportFormat.md;
    const duplicatePageBulkExportJobInProgress: PageBulkExportJobDocument & HasObjectId | null = await PageBulkExportJob.findOne({
      user: currentUser,
      page: basePage,
      format,
      $or: [
        { status: PageBulkExportJobStatus.initializing }, { status: PageBulkExportJobStatus.exporting }, { status: PageBulkExportJobStatus.uploading },
      ],
    });
    if (duplicatePageBulkExportJobInProgress != null) {
      throw new DuplicateBulkExportJobError();
    }
    const pageBulkExportJob: PageBulkExportJobDocument & HasObjectId = await PageBulkExportJob.create({
      user: currentUser, page: basePage, format, status: PageBulkExportJobStatus.initializing,
    });

    await Subscription.upsertSubscription(currentUser, SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB, pageBulkExportJob, SubscriptionStatusType.SUBSCRIBE);

    this.executePageBulkExportJob(currentUser, activityParameters, pageBulkExportJob);
  }

  private async executePageBulkExportJob(
      currentUser, activityParameters: ActivityParameters, pageBulkExportJob: PageBulkExportJobDocument & HasObjectId,
  ): Promise<void> {
    try {
      if (pageBulkExportJob.status === PageBulkExportJobStatus.initializing) {
        await this.createPageSnapshots(currentUser, pageBulkExportJob);
        pageBulkExportJob.status = PageBulkExportJobStatus.exporting;
        await pageBulkExportJob.save();
      }
      if (pageBulkExportJob.status === PageBulkExportJobStatus.exporting) {
        await this.exportPagesToFS(pageBulkExportJob);
        pageBulkExportJob.status = PageBulkExportJobStatus.uploading;
        await pageBulkExportJob.save();
      }
      if (pageBulkExportJob.status === PageBulkExportJobStatus.uploading) {
        await this.compressAndUpload(currentUser, pageBulkExportJob);
      }
    }
    catch (err) {
      logger.error(err);
      await this.notifyExportResultAndCleanUp(false, activityParameters, pageBulkExportJob);
      return;
    }

    await this.notifyExportResultAndCleanUp(true, activityParameters, pageBulkExportJob);
  }

  /**
   * Handles export failure with the following:
   * - notify the user of the failure
   * - delete page snapshots
   * - remove the temporal output directory
   * - set status of pageBulkExportJob to 'failed'
   */
  private async notifyExportResultAndCleanUp(
      succeeded: boolean,
      activityParameters: ActivityParameters,
      pageBulkExportJob: PageBulkExportJobDocument,
  ): Promise<void> {
    const action = succeeded ? SupportedAction.ACTION_PAGE_BULK_EXPORT_COMPLETED : SupportedAction.ACTION_PAGE_BULK_EXPORT_FAILED;
    pageBulkExportJob.status = succeeded ? PageBulkExportJobStatus.completed : PageBulkExportJobStatus.failed;
    const results = await Promise.allSettled([
      this.notifyExportResult(activityParameters, pageBulkExportJob, action),
      PageBulkExportPageSnapshot.deleteMany({ pageBulkExportJob }),
      fs.promises.rm(this.getTmpOutputDir(pageBulkExportJob), { recursive: true, force: true }),
      pageBulkExportJob.save(),
    ]);
    results.forEach((result) => {
      if (result.status === 'rejected') logger.error(result.reason);
    });
  }

  /**
   * Export pages to the file system before compressing and uploading to the cloud storage.
   * The export will resume from the last exported page if the process was interrupted.
   */
  private async exportPagesToFS(pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
    const pageSnapshotsReadable = PageBulkExportPageSnapshot
      .find({ pageBulkExportJob, path: { $gt: pageBulkExportJob.lastExportedPagePath } })
      .populate('revision').sort({ path: 1 }).lean()
      .cursor({ batchSize: this.pageBatchSize });
    const pagesWritable = this.getPageWritable(pageBulkExportJob);

    return pipelinePromise(pageSnapshotsReadable, pagesWritable);
  }

  /**
   * Create a snapshot for each page that is to be exported in the pageBulkExportJob
   */
  private async createPageSnapshots(currentUser, pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
    // if the process of creating snapshots was interrupted, delete the snapshots and create from the start
    await PageBulkExportPageSnapshot.deleteMany({ pageBulkExportJob });

    const basePage = await this.pageModel.findById(pageBulkExportJob.page);
    if (basePage == null) {
      throw new Error('Base page not found');
    }

    // create a Readable for pages to be exported
    const { PageQueryBuilder } = this.pageModel;
    const builder = await new PageQueryBuilder(this.pageModel.find())
      .addConditionToListWithDescendants(basePage.path)
      .addViewerCondition(currentUser);
    const pagesReadable = builder
      .query
      .lean()
      .cursor({ batchSize: this.pageBatchSize });

    // create a Writable that creates a snapshot for each page
    const pageSnapshotsWritable = new Writable({
      objectMode: true,
      write: async(page: PageDocument, encoding, callback) => {
        try {
          await PageBulkExportPageSnapshot.create({
            pageBulkExportJob,
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

    await pipelinePromise(pagesReadable, pageSnapshotsWritable);
  }

  /**
   * Get a Writable that writes the page body temporarily to fs
   */
  private getPageWritable(pageBulkExportJob: PageBulkExportJobDocument): Writable {
    const outputDir = this.getTmpOutputDir(pageBulkExportJob);
    return new Writable({
      objectMode: true,
      write: async(page: PageBulkExportPageSnapshotDocument, encoding, callback) => {
        try {
          const revision = page.revision;

          if (revision != null && isPopulated(revision)) {
            const markdownBody = revision.body;
            const pathNormalized = `${normalizePath(page.path)}.md`;
            const fileOutputPath = path.join(outputDir, pathNormalized);
            const fileOutputParentPath = getParentPath(fileOutputPath);

            await fs.promises.mkdir(fileOutputParentPath, { recursive: true });
            await fs.promises.writeFile(fileOutputPath, markdownBody);
            pageBulkExportJob.lastExportedPagePath = page.path;
            await pageBulkExportJob.save();
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
          await multipartUploader.abortUpload();
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
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
    });
  }

  private async compressAndUpload(currentUser, pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
    const pageArchiver = this.setUpPageArchiver();
    const bufferToPartSizeTransform = getBufferToFixedSizeTransform(this.maxPartSize);

    const originalName = `${pageBulkExportJob._id}.${this.compressExtension}`;
    const attachment = Attachment.createWithoutSave(null, currentUser, originalName, this.compressExtension, 0, AttachmentType.PAGE_BULK_EXPORT);
    const uploadKey = `${FilePathOnStoragePrefix.pageBulkExport}/${attachment.fileName}`;

    const fileUploadService: FileUploader = this.crowi.fileUploadService;
    // if the process of uploading was interrupted, delete and start from the start
    if (pageBulkExportJob.uploadId != null) {
      await fileUploadService.abortExistingMultipartUpload(uploadKey, pageBulkExportJob.uploadId);
    }

    // init multipart upload
    const multipartUploader: IMultipartUploader = fileUploadService.createMultipartUploader(uploadKey, this.maxPartSize);
    await multipartUploader.initUpload();
    pageBulkExportJob.uploadId = multipartUploader.uploadId;
    await pageBulkExportJob.save();

    const multipartUploadWritable = this.getMultipartUploadWritable(multipartUploader, pageBulkExportJob, attachment);

    const compressAndUploadPromise = pipelinePromise(pageArchiver, bufferToPartSizeTransform, multipartUploadWritable);
    pageArchiver.directory(this.getTmpOutputDir(pageBulkExportJob), false);
    pageArchiver.finalize();

    await compressAndUploadPromise;
  }

  private getTmpOutputDir(pageBulkExportJob: PageBulkExportJobDocument): string {
    return `${this.tmpOutputRootDir}/page-bulk-export/${pageBulkExportJob._id}`;
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
