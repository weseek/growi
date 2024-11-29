import { configManager } from '~/server/service/config-manager';
import CronService from '~/server/service/cron';
import loggerFactory from '~/utils/logger';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

import { PageBulkExportFormat, PageBulkExportJobInProgressStatus, PageBulkExportJobStatus } from '../../../interfaces/page-bulk-export';
import type { PageBulkExportJobDocument } from '../../models/page-bulk-export-job';
import PageBulkExportJob from '../../models/page-bulk-export-job';
import { IPage, IUser, getIdStringForRef, isPopulated } from '@growi/core';

import type { Archiver } from 'archiver';
import archiver from 'archiver';

import gc from 'expose-gc/function';
import { getIdForRef } from '^/../../packages/core/dist';
import PageBulkExportPageSnapshot, { PageBulkExportPageSnapshotDocument } from '../../models/page-bulk-export-page-snapshot';
import { PageDocument, PageModel } from '~/server/models/page';
import { createHash } from 'crypto';
import { Writable, pipeline } from 'stream';
import { SupportedAction, SupportedActionType, SupportedTargetModel } from '~/interfaces/activity';
import { ActivityDocument } from '~/server/models/activity';
import { preNotifyService } from '~/server/service/pre-notify';
import { FileUploader } from '~/server/service/file-uploader';
import { BulkExportJobExpiredError, BulkExportJobRestartedError } from './errors';
import { getParentPath, normalizePath } from '^/../../packages/core/dist/utils/path-utils';
import { getBufferToFixedSizeTransform } from '~/server/util/stream';
import { Attachment, IAttachmentDocument } from '~/server/models/attachment';
import { AttachmentType, FilePathOnStoragePrefix } from '~/server/interfaces/attachment';
import { IMultipartUploader } from '~/server/service/file-uploader/multipart-uploader';

const logger = loggerFactory('growi:service:page-bulk-export-job-cron');

class PageBulkExportJobCronService extends CronService {

  crowi: any;

  activityEvent: any;

  // multipart upload max part size
  maxPartSize = 5 * 1024 * 1024; // 5MB

  pageBatchSize = 100;

  compressExtension = 'tar.gz';

  // temporal path of local fs to output page files before upload
  // TODO: If necessary, change to a proper path in https://redmine.weseek.co.jp/issues/149512
  tmpOutputRootDir = '/tmp/page-bulk-export';

  pageModel: PageModel;

  userModel: mongoose.Model<IUser, {}, {}, {}, any>;

  private parallelExecLimit: number;

  constructor(crowi) {
    super();
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');
    this.pageModel = mongoose.model<IPage, PageModel>('Page');
    this.userModel = mongoose.model<IUser>('User');
    this.parallelExecLimit = configManager.getConfig('crowi', 'app:pageBulkExportParallelExecLimit');
  }

  override getCronSchedule(): string {
    return configManager.getConfig('crowi', 'app:pageBulkExportJobCronSchedule');
  }

  override async executeJob(): Promise<void> {
    const pageBulkExportJobsInProgress = await PageBulkExportJob.find({
      status: PageBulkExportJobInProgressStatus,
    }).sort({ createdAt: 1 }).limit(this.parallelExecLimit);

    pageBulkExportJobsInProgress.forEach(async(pageBulkExportJob) => {
      if (pageBulkExportJob.status === pageBulkExportJob.statusOnPreviousCronExec) {
        return;
      }
      try {
        const user = await this.userModel.findById(getIdForRef(pageBulkExportJob.user));

        // update statusOnPreviousCronExec before starting processes that update status
        pageBulkExportJob.statusOnPreviousCronExec = pageBulkExportJob.status;
        await pageBulkExportJob.save();

        if (pageBulkExportJob.status === PageBulkExportJobStatus.initializing) {
          this.createPageSnapshotsAsync(user, pageBulkExportJob);
        }
        else if (pageBulkExportJob.status === PageBulkExportJobStatus.exporting) {
          const duplicateExportJob = await PageBulkExportJob.findOne({
            user: pageBulkExportJob.user,
            page: pageBulkExportJob.page,
            format: pageBulkExportJob.format,
            status: PageBulkExportJobStatus.completed,
            revisionListHash: pageBulkExportJob.revisionListHash,
          });
          if (duplicateExportJob != null) {
            // if an upload with the exact same contents exists, re-use the same attachment of that upload
            pageBulkExportJob.attachment = duplicateExportJob.attachment;
            pageBulkExportJob.status = PageBulkExportJobStatus.completed;
          }
          else {
            this.exportPagesToFS(pageBulkExportJob);
          }
        }
        else if (pageBulkExportJob.status === PageBulkExportJobStatus.uploading) {
          this.compressAndUpload(user, pageBulkExportJob);
        }
      } catch (err) {
        logger.error(err);
        await this.notifyExportResultAndCleanUp(SupportedAction.ACTION_PAGE_BULK_EXPORT_FAILED, pageBulkExportJob);
      }
    });
  }

  /**
   * Notify the user of the export result, and cleanup the resources used in the export process
   * @param action whether the export was successful
   * @param pageBulkExportJob the page bulk export job
   */
  private async notifyExportResultAndCleanUp(
      action: SupportedActionType,
      pageBulkExportJob: PageBulkExportJobDocument,
  ): Promise<void> {
    pageBulkExportJob.status = action === SupportedAction.ACTION_PAGE_BULK_EXPORT_COMPLETED
      ? PageBulkExportJobStatus.completed : PageBulkExportJobStatus.failed;

    try {
      await pageBulkExportJob.save();
      await this.notifyExportResult(pageBulkExportJob, action);
    }
    catch (err) {
      logger.error(err);
    }
    // execute independently of notif process resolve/reject
    await this.cleanUpExportJobResources(pageBulkExportJob);
  }

  /**
   * Start a pipeline that creates a snapshot for each page that is to be exported in the pageBulkExportJob.
   * 'revisionListHash' is calulated and saved to the pageBulkExportJob at the end of the pipeline.
   */
  private async createPageSnapshotsAsync(user, pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
    // if the process of creating snapshots was interrupted, delete the snapshots and create from the start
    await PageBulkExportPageSnapshot.deleteMany({ pageBulkExportJob });

    const basePage = await this.pageModel.findById(getIdForRef(pageBulkExportJob.page));
    if (basePage == null) {
      throw new Error('Base page not found');
    }

    const revisionListHash = createHash('sha256');

    // create a Readable for pages to be exported
    const { PageQueryBuilder } = this.pageModel;
    const builder = await new PageQueryBuilder(this.pageModel.find())
      .addConditionToListWithDescendants(basePage.path)
      .addViewerCondition(user);
    const pagesReadable = builder
      .query
      .lean()
      .cursor({ batchSize: this.pageBatchSize });

    // create a Writable that creates a snapshot for each page
    const pageSnapshotsWritable = new Writable({
      objectMode: true,
      write: async(page: PageDocument, encoding, callback) => {
        try {
          if (page.revision != null) {
            revisionListHash.update(getIdStringForRef(page.revision));
          }
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
      final: async(callback) => {
        pageBulkExportJob.revisionListHash = revisionListHash.digest('hex');
        pageBulkExportJob.status = PageBulkExportJobStatus.exporting;
        await pageBulkExportJob.save();
        callback();
      }
    });

    pipeline(pagesReadable, pageSnapshotsWritable, (err) => {
      this.handlePipelineError(err, pageBulkExportJob);
    });
  }

  /**
   * Export pages to the file system before compressing and uploading to the cloud storage.
   * The export will resume from the last exported page if the process was interrupted.
   */
  private async exportPagesToFS(pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
    const findQuery = pageBulkExportJob.lastExportedPagePath != null ? {
      pageBulkExportJob,
      path: { $gt: pageBulkExportJob.lastExportedPagePath },
    } : { pageBulkExportJob };
    const pageSnapshotsReadable = PageBulkExportPageSnapshot
      .find(findQuery)
      .populate('revision').sort({ path: 1 }).lean()
      .cursor({ batchSize: this.pageBatchSize });

    const pagesWritable = this.getPageWritable(pageBulkExportJob);

    pipeline(pageSnapshotsReadable, pagesWritable, (err) => {
      this.handlePipelineError(err, pageBulkExportJob);
    });
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
            const pathNormalized = `${normalizePath(page.path)}.${PageBulkExportFormat.md}`;
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
      final: async(callback) => {
        pageBulkExportJob.status = PageBulkExportJobStatus.uploading;
        await pageBulkExportJob.save();
        callback();
      }
    });
  }

  /**
   * Execute a pipeline that reads the page files from the temporal fs directory, compresses them, and uploads to the cloud storage
   */
  private async compressAndUpload(user, pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
    const pageArchiver = this.setUpPageArchiver();
    const bufferToPartSizeTransform = getBufferToFixedSizeTransform(this.maxPartSize);

    if (pageBulkExportJob.revisionListHash == null) throw new Error('revisionListHash is not set');
    const originalName = `${pageBulkExportJob.revisionListHash}.${this.compressExtension}`;
    const attachment = Attachment.createWithoutSave(null, user, originalName, this.compressExtension, 0, AttachmentType.PAGE_BULK_EXPORT);
    const uploadKey = `${FilePathOnStoragePrefix.pageBulkExport}/${attachment.fileName}`;

    const fileUploadService: FileUploader = this.crowi.fileUploadService;
    // if the process of uploading was interrupted, delete and start from the start
    if (pageBulkExportJob.uploadKey != null && pageBulkExportJob.uploadId != null) {
      await fileUploadService.abortPreviousMultipartUpload(pageBulkExportJob.uploadKey, pageBulkExportJob.uploadId);
    }

    // init multipart upload
    const multipartUploader: IMultipartUploader = fileUploadService.createMultipartUploader(uploadKey, this.maxPartSize);
    await multipartUploader.initUpload();
    pageBulkExportJob.uploadKey = uploadKey;
    pageBulkExportJob.uploadId = multipartUploader.uploadId;
    await pageBulkExportJob.save();

    const multipartUploadWritable = this.getMultipartUploadWritable(multipartUploader, pageBulkExportJob, attachment);

    pipeline(pageArchiver, bufferToPartSizeTransform, multipartUploadWritable, (err) => {
      this.handlePipelineError(err, pageBulkExportJob);
    });
    pageArchiver.directory(this.getTmpOutputDir(pageBulkExportJob), false);
    pageArchiver.finalize();
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
          pageBulkExportJob.status = PageBulkExportJobStatus.completed;
          await pageBulkExportJob.save();

          await this.notifyExportResultAndCleanUp(SupportedAction.ACTION_PAGE_BULK_EXPORT_COMPLETED, pageBulkExportJob);
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
    });
  }

  async handlePipelineError(err: Error | null, pageBulkExportJob: PageBulkExportJobDocument) {
    if (err == null) return;

    if (err instanceof BulkExportJobExpiredError) {
      logger.error(err);
      await this.notifyExportResultAndCleanUp(SupportedAction.ACTION_PAGE_BULK_EXPORT_JOB_EXPIRED, pageBulkExportJob);
    }
    else if (err instanceof BulkExportJobRestartedError) {
      logger.info(err.message);
      await this.cleanUpExportJobResources(pageBulkExportJob);
    }
    else {
      logger.error(err);
      await this.notifyExportResultAndCleanUp(SupportedAction.ACTION_PAGE_BULK_EXPORT_FAILED, pageBulkExportJob);
    }
  }

  /**
   * Get the output directory on the fs to temporarily store page files before compressing and uploading
   */
  private getTmpOutputDir(pageBulkExportJob: PageBulkExportJobDocument): string {
    return `${this.tmpOutputRootDir}/${pageBulkExportJob._id}`;
  }

  async notifyExportResult(
      pageBulkExportJob: PageBulkExportJobDocument, action: SupportedActionType,
  ) {
    const activity = await this.crowi.activityService.createActivity({
      action,
      targetModel: SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB,
      target: pageBulkExportJob,
      user: pageBulkExportJob.user,
      snapshot: {
        username: isPopulated(pageBulkExportJob.user) ? pageBulkExportJob.user.username : '',
      },
    });
    const getAdditionalTargetUsers = async(activity: ActivityDocument) => [activity.user];
    const preNotify = preNotifyService.generatePreNotify(activity, getAdditionalTargetUsers);
    this.activityEvent.emit('updated', activity, pageBulkExportJob, preNotify);
  }

  /**
   * Do the following in parallel:
   * - delete page snapshots
   * - remove the temporal output directory
   * - abort multipart upload
   */
  async cleanUpExportJobResources(pageBulkExportJob: PageBulkExportJobDocument, restarted = false) {
    const promises = [
      PageBulkExportPageSnapshot.deleteMany({ pageBulkExportJob }),
      fs.promises.rm(this.getTmpOutputDir(pageBulkExportJob), { recursive: true, force: true }),
    ];

    const fileUploadService: FileUploader = this.crowi.fileUploadService;
    if (pageBulkExportJob.uploadKey != null && pageBulkExportJob.uploadId != null) {
      promises.push(fileUploadService.abortPreviousMultipartUpload(pageBulkExportJob.uploadKey, pageBulkExportJob.uploadId));
    }

    const results = await Promise.allSettled(promises);
    results.forEach((result) => {
      if (result.status === 'rejected') logger.error(result.reason);
    });
  }

}

// eslint-disable-next-line import/no-mutable-exports
export let pageBulkExportJobCronService: PageBulkExportJobCronService | undefined; // singleton instance
export default function instanciate(crowi): void {
  pageBulkExportJobCronService = new PageBulkExportJobCronService(crowi);
}
