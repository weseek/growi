import type { Readable } from 'stream';
import { Writable, pipeline } from 'stream';

import { type IPage, isPopulated, SubscriptionStatusType } from '@growi/core';
import { normalizePath } from '@growi/core/dist/utils/path-utils';
import type { Archiver } from 'archiver';
import archiver from 'archiver';
import type { QueueObject } from 'async';
import gc from 'expose-gc/function';
import mongoose from 'mongoose';

import { SupportedAction, SupportedTargetModel } from '~/interfaces/activity';
import type { PageModel, PageDocument } from '~/server/models/page';
import Subscription from '~/server/models/subscription';
import type { IAwsMultipartUploader } from '~/server/service/file-uploader/aws/multipart-upload';
import { preNotifyService } from '~/server/service/pre-notify';
import { getBufferToFixedSizeTransform } from '~/server/util/stream';
import loggerFactory from '~/utils/logger';

import { PageBulkExportFormat } from '../../interfaces/page-bulk-export';
import type { PageBulkExportJobDocument } from '../models/page-bulk-export-job';
import PageBulkExportJob from '../models/page-bulk-export-job';

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

  // multipart upload part size
  partSize = 5 * 1024 * 1024; // 5MB

  pageBatchSize = 100;

  constructor(crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');
  }

  async bulkExportWithBasePagePath(basePagePath: string, currentUser, activityParameters: ActivityParameters): Promise<void> {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const basePage = await Page.findByPathAndViewer(basePagePath, currentUser, null, true);

    if (basePage == null) {
      this.handleExportError(new Error('Base page not found or not accessible'));
      return;
    }

    const timeStamp = (new Date()).getTime();
    const uploadKey = `page-bulk-export-${timeStamp}.zip`;

    const pagesReadable = this.getPageReadable(basePagePath);
    const zipArchiver = this.setUpZipArchiver();
    const pagesWritable = this.getPageWritable(zipArchiver);
    const bufferToPartSizeTransform = getBufferToFixedSizeTransform(this.partSize);
    let multipartUploadWritable: Writable;

    // init multipart upload
    // TODO: Create abstract interface IMultipartUploader in https://redmine.weseek.co.jp/issues/135775
    const multipartUploader: IAwsMultipartUploader | undefined = this.crowi?.fileUploadService?.createMultipartUploader(uploadKey);
    try {
      if (multipartUploader == null) {
        throw Error('Multipart upload not available for configured file upload type');
      }
      await multipartUploader.initUpload();

      const pageBulkExportJob = await PageBulkExportJob.create({
        user: currentUser._id,
        page: basePage._id,
        uploadId: multipartUploader.uploadId,
        format: PageBulkExportFormat.markdown,
      });
      await Subscription.upsertSubscription(currentUser, SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB, pageBulkExportJob, SubscriptionStatusType.SUBSCRIBE);

      multipartUploadWritable = this.getMultipartUploadWritable(multipartUploader, pageBulkExportJob, currentUser, activityParameters);
    }
    catch (err) {
      await this.handleExportError(err, multipartUploader);
      return;
    }

    // Cannot directly pipe from pagesWritable to zipArchiver due to how the 'append' method works.
    // Hence, execution of two pipelines is required.
    pipeline(pagesReadable, pagesWritable, err => this.handleExportError(err, multipartUploader));
    pipeline(zipArchiver, bufferToPartSizeTransform, multipartUploadWritable, err => this.handleExportError(err, multipartUploader));
  }

  async handleExportError(err: Error | null, multipartUploader?: IAwsMultipartUploader): Promise<void> {
    if (err != null) {
      logger.error(err);
      if (multipartUploader != null) {
        await multipartUploader.abortUpload();
      }
      // TODO: notify failure to client: https://redmine.weseek.co.jp/issues/78037
    }
  }

  /**
   * Get a Readable of all the pages under the specified path, including the root page.
   */
  private getPageReadable(basePagePath: string): Readable {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const { PageQueryBuilder } = Page;

    const builder = new PageQueryBuilder(Page.find())
      .addConditionToListWithDescendants(basePagePath);

    return builder
      .query
      .populate('revision')
      .lean()
      .cursor({ batchSize: this.pageBatchSize });
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
      multipartUploader: IAwsMultipartUploader, pageBulkExportJob: PageBulkExportJobDocument, user, activityParameters: ActivityParameters,
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
          pageBulkExportJob.completedAt = new Date();
          await pageBulkExportJob.save();

          const activity = await this.crowi.activityService.createActivity({
            ...activityParameters,
            action: SupportedAction.ACTION_PAGE_BULK_EXPORT_COMPLETED,
            user,
            targetModel: SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB,
            target: pageBulkExportJob,
            snapshot: {
              username: user.username,
            },
          });
          const preNotify = preNotifyService.generatePreNotify(activity);
          this.activityEvent.emit('updated', activity, pageBulkExportJob, preNotify);
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
    });
  }

}

// eslint-disable-next-line import/no-mutable-exports
export let pageBulkExportService: PageBulkExportService | undefined; // singleton instance
export default function instanciate(crowi): void {
  pageBulkExportService = new PageBulkExportService(crowi);
}
