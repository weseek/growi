import type { Readable } from 'stream';
import { Writable, pipeline } from 'stream';

import type { HasObjectId } from '@growi/core';
import { type IPage, isPopulated, SubscriptionStatusType } from '@growi/core';
import { normalizePath } from '@growi/core/dist/utils/path-utils';
import type { Archiver } from 'archiver';
import archiver from 'archiver';
import type { QueueObject } from 'async';
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

// Custom type for back pressure workaround
interface ArchiverWithQueue extends Archiver {
  _queue?: QueueObject<any>;
}

type ActivityParameters ={
  ip: string;
  endpoint: string;
}

class PageBulkExportService {

  crowi: any;

  activityEvent: any;

  // multipart upload max part size
  maxPartSize = 5 * 1024 * 1024; // 5MB

  pageBatchSize = 100;

  constructor(crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');
  }

  async export(basePagePath: string, currentUser, activityParameters: ActivityParameters): Promise<void> {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const basePage = await Page.findByPathAndViewer(basePagePath, currentUser, null, true);

    if (basePage == null) {
      throw new Error('Base page not found or not accessible');
    }

    const timeStamp = (new Date()).getTime();
    const originalName = `page-bulk-export-${timeStamp}.zip`;
    const attachment = Attachment.createWithoutSave(null, currentUser, originalName, 'zip', 0, AttachmentType.PAGE_BULK_EXPORT);
    const uploadKey = `${FilePathOnStoragePrefix.pageBulkExport}/${attachment.fileName}`;

    const pagesReadable = this.getPageReadable(basePagePath, true);
    const zipArchiver = this.setUpZipArchiver();
    const pagesWritable = this.getPageWritable(zipArchiver);
    const bufferToPartSizeTransform = getBufferToFixedSizeTransform(this.maxPartSize);

    // init multipart upload
    const fileUploadService: FileUploader = this.crowi.fileUploadService;
    const multipartUploader: IMultipartUploader = fileUploadService.createMultipartUploader(uploadKey, this.maxPartSize);
    let pageBulkExportJob: PageBulkExportJobDocument & HasObjectId;
    try {
      await multipartUploader.initUpload();
      pageBulkExportJob = await PageBulkExportJob.create({
        user: currentUser,
        page: basePage,
        uploadId: multipartUploader.uploadId,
        format: PageBulkExportFormat.markdown,
      });
      await Subscription.upsertSubscription(currentUser, SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB, pageBulkExportJob, SubscriptionStatusType.SUBSCRIBE);
      await this.createPageSnapshots(basePagePath, pageBulkExportJob);
    }
    catch (err) {
      logger.error(err);
      await multipartUploader.abortUpload();
      throw err;
    }

    const multipartUploadWritable = this.getMultipartUploadWritable(multipartUploader, pageBulkExportJob, attachment, activityParameters);

    // Cannot directly pipe from pagesWritable to zipArchiver due to how the 'append' method works.
    // Hence, execution of two pipelines is required.
    pipeline(pagesReadable, pagesWritable, err => this.handleExportErrorInStream(err, activityParameters, pageBulkExportJob, multipartUploader));
    pipeline(zipArchiver, bufferToPartSizeTransform, multipartUploadWritable,
      err => this.handleExportErrorInStream(err, activityParameters, pageBulkExportJob, multipartUploader));
  }

  private async handleExportErrorInStream(
      err: Error | null, activityParameters: ActivityParameters, pageBulkExportJob: PageBulkExportJobDocument, multipartUploader: IMultipartUploader,
  ): Promise<void> {
    if (err != null) {
      await multipartUploader.abortUpload();
      await this.notifyExportResult(activityParameters, pageBulkExportJob, SupportedAction.ACTION_PAGE_BULK_EXPORT_FAILED);
    }
  }

  /**
   * Get a Readable of all the pages under the specified path, including the root page.
   */
  private getPageReadable(basePagePath: string, populateRevision = false): Readable {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const { PageQueryBuilder } = Page;

    const builder = new PageQueryBuilder(Page.find())
      .addConditionToListWithDescendants(basePagePath);

    if (populateRevision) {
      builder.query = builder.query.populate('revision');
    }

    return builder
      .query
      .lean()
      .cursor({ batchSize: this.pageBatchSize });
  }

  private async createPageSnapshots(basePagePath: string, pageBulkExportJob: PageBulkExportJobDocument) {
    const pagesReadable = this.getPageReadable(basePagePath);
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
   * Get a Writable that writes the page body to a zip file
   */
  private getPageWritable(zipArchiver: Archiver): Writable {
    return new Writable({
      objectMode: true,
      write: async(page: PageDocument, encoding, callback) => {
        try {
          const revision = page.revision;

          if (revision != null && isPopulated(revision)) {
            const markdownBody = revision.body;
            const pathNormalized = normalizePath(page.path);
            // Since archiver does not provide a proper way to back pressure at the moment, use the _queue property as a workaround
            // ref: https://github.com/archiverjs/node-archiver/issues/611
            const { _queue } = zipArchiver.append(markdownBody, { name: `${pathNormalized}.md` }) as ArchiverWithQueue;
            if (_queue == null) {
              throw Error('Cannot back pressure the export pipeline. Aborting the export.');
            }
            if (_queue.length() > this.pageBatchSize) {
              await _queue.drain();
            }
          }
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
      final: (callback) => {
        zipArchiver.finalize();
        callback();
      },
    });
  }

  private setUpZipArchiver(): Archiver {
    const zipArchiver = archiver('zip', {
      zlib: { level: 9 }, // maximum compression
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    zipArchiver.on('warning', (err) => {
      if (err.code === 'ENOENT') logger.error(err);
      else throw err;
    });

    return zipArchiver;
  }

  private getMultipartUploadWritable(
      multipartUploader: IMultipartUploader,
      pageBulkExportJob: PageBulkExportJobDocument,
      attachment: IAttachmentDocument,
      activityParameters: ActivityParameters,
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
