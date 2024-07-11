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
import { Cluster } from 'puppeteer-cluster';
import remark from 'remark';
import html from 'remark-html';

import type { SupportedActionType } from '~/interfaces/activity';
import { SupportedAction, SupportedTargetModel } from '~/interfaces/activity';
import { AttachmentType, FilePathOnStoragePrefix } from '~/server/interfaces/attachment';
import type { IAttachmentDocument } from '~/server/models';
import { Attachment } from '~/server/models';
import type { ActivityDocument } from '~/server/models/activity';
import type { PageModel, PageDocument } from '~/server/models/page';
import Subscription from '~/server/models/subscription';
import { configManager } from '~/server/service/config-manager';
import type { FileUploader } from '~/server/service/file-uploader';
import type { IMultipartUploader } from '~/server/service/file-uploader/multipart-uploader';
import { preNotifyService } from '~/server/service/pre-notify';
import { getBufferToFixedSizeTransform } from '~/server/util/stream';
import loggerFactory from '~/utils/logger';

import { PageBulkExportFormat } from '../../interfaces/page-bulk-export';
import type { PageBulkExportJobDocument } from '../models/page-bulk-export-job';
import PageBulkExportJob from '../models/page-bulk-export-job';


const logger = loggerFactory('growi:services:PageBulkExportService');

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

  compressExtension = 'tar.gz';

  // temporal path of local fs to output page files before upload
  // TODO: If necessary, change to a proper path in https://redmine.weseek.co.jp/issues/149512
  tmpOutputRootDir = '/tmp';

  puppeteerCluster: Cluster | undefined;

  constructor(crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');
  }

  async createAndStartPageBulkExportJob(
      basePagePath: string, format: PageBulkExportFormat, currentUser, activityParameters: ActivityParameters,
  ): Promise<void> {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const basePage = await Page.findByPathAndViewer(basePagePath, currentUser, null, true);

    if (basePage == null) {
      throw new Error('Base page not found or not accessible');
    }

    const pageBulkExportJob: PageBulkExportJobDocument & HasObjectId = await PageBulkExportJob.create({
      user: currentUser,
      page: basePage,
      format,
    });

    await Subscription.upsertSubscription(currentUser, SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB, pageBulkExportJob, SubscriptionStatusType.SUBSCRIBE);

    this.bulkExportWithBasePagePath(basePagePath, format, currentUser, activityParameters, pageBulkExportJob);
  }

  private async bulkExportWithBasePagePath(
      basePagePath: string,
      format: PageBulkExportFormat,
      currentUser,
      activityParameters: ActivityParameters,
      pageBulkExportJob: PageBulkExportJobDocument & HasObjectId,
  ): Promise<void> {
    const timeStamp = (new Date()).getTime();
    const exportName = `page-bulk-export-${timeStamp}`;

    // export pages to fs temporarily
    const tmpOutputDir = `${this.tmpOutputRootDir}/${exportName}`;
    try {
      await this.exportPagesToFS(basePagePath, tmpOutputDir, currentUser, format);
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

  private async exportPagesToFS(basePagePath: string, outputDir: string, currentUser, format: PageBulkExportFormat): Promise<void> {
    const pagesReadable = await this.getPageReadable(basePagePath, currentUser);
    const pagesWritable = await this.getPageWritable(outputDir, format);

    return pipelinePromise(pagesReadable, pagesWritable);
  }

  /**
   * Get a Readable of all the pages under the specified path, including the root page.
   */
  private async getPageReadable(basePagePath: string, currentUser): Promise<Readable> {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const { PageQueryBuilder } = Page;

    const builder = await new PageQueryBuilder(Page.find())
      .addConditionToListWithDescendants(basePagePath)
      .addViewerCondition(currentUser);

    return builder
      .query
      .populate('revision')
      .lean()
      .cursor({ batchSize: this.pageBatchSize });
  }

  /**
   * Get a Writable that writes the page body temporarily to fs
   */
  private async getPageWritable(outputDir: string, format: PageBulkExportFormat): Promise<Writable> {
    return new Writable({
      objectMode: true,
      write: async(page: PageDocument, encoding, callback) => {
        try {
          const revision = page.revision;

          if (revision != null && isPopulated(revision)) {
            const pageBody = format === PageBulkExportFormat.pdf ? (await this.convertMdToPdf(revision.body)) : revision.body;
            gc();
            const pathNormalized = `${normalizePath(page.path)}.${format}`;
            const fileOutputPath = path.join(outputDir, pathNormalized);
            const fileOutputParentPath = getParentPath(fileOutputPath);

            await fs.promises.mkdir(fileOutputParentPath, { recursive: true });
            await fs.promises.writeFile(fileOutputPath, pageBody);
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

  /**
   * Initialize puppeteer cluster for converting markdown to pdf
   */
  async initPuppeteerCluster(): Promise<void> {
    this.puppeteerCluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: configManager.getConfig('crowi', 'app:bulkExportPuppeteerClusterMaxConcurrency'),
      workerCreationDelay: 10000,
      monitor: true,
    });

    await this.puppeteerCluster.task(async({ page, data: htmlString }) => {
      await page.setContent(htmlString, { waitUntil: 'domcontentloaded' });
      await page.emulateMediaType('screen');
      const pdfResult = await page.pdf({
        margin: {
          top: '100px', right: '50px', bottom: '100px', left: '50px',
        },
        printBackground: true,
        format: 'A4',
      });
      return pdfResult;
    });

    // close cluster on app termination
    const handleClose = async() => {
      logger.info('Closing puppeteer cluster...');
      await this.puppeteerCluster?.idle();
      await this.puppeteerCluster?.close();
      process.exit();
    };
    process.on('SIGINT', handleClose);
    process.on('SIGTERM', handleClose);
  }

  /**
   * Convert markdown string to html, then to PDF
   * PDF conversion can be unstable, so retry up to the specified limit
   */
  private async convertMdToPdf(md: string): Promise<Buffer> {
    const executeConvert = async(htmlString: string, retries: number) => {
      if (this.puppeteerCluster == null) {
        throw new Error('Puppeteer cluster is not initialized');
      }

      try {
        return await this.puppeteerCluster.execute(htmlString);
      }
      catch (err) {
        if (retries > 0) {
          logger.error('Failed to convert markdown to pdf. Retrying...', err);
          return executeConvert(htmlString, retries - 1);
        }
        throw err;
      }
    };

    const htmlString = (await remark()
      .use(html)
      .process(md))
      .toString();

    const result = await executeConvert(htmlString, configManager.getConfig('crowi', 'app:bulkExportPuppeteerRetryLimit'));

    return result;
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
export default async function instanciate(crowi): Promise<void> {
  pageBulkExportService = new PageBulkExportService(crowi);
  await pageBulkExportService.initPuppeteerCluster();
}
