import type { Readable } from 'stream';
import { Writable, pipeline } from 'stream';

import { type IPage, isPopulated } from '@growi/core';
import { normalizePath } from '@growi/core/dist/utils/path-utils';
import type { Archiver } from 'archiver';
import archiver from 'archiver';
import type { QueueObject } from 'async';
import gc from 'expose-gc/function';
import mongoose from 'mongoose';
import type { Browser } from 'puppeteer';
import puppeteer from 'puppeteer';
import remark from 'remark';
import html from 'remark-html';

import type { PageModel, PageDocument } from '~/server/models/page';
import type { IAwsMultipartUploader } from '~/server/service/file-uploader/aws/multipart-upload';
import { getBufferToFixedSizeTransform } from '~/server/util/stream';
import loggerFactory from '~/utils/logger';

import { PageBulkExportFormat } from '../../interfaces/page-bulk-export';

const logger = loggerFactory('growi:services:PageBulkExportService');

// Custom type for back pressure workaround
interface ArchiverWithQueue extends Archiver {
  _queue?: QueueObject<any>;
}

class PageBulkExportService {

  crowi: any;

  // multipart upload part size
  partSize = 5 * 1024 * 1024; // 5MB

  pageBatchSize = 100;

  constructor(crowi) {
    this.crowi = crowi;
  }

  async bulkExportWithBasePagePath(basePagePath: string, format: string): Promise<void> {
    const timeStamp = (new Date()).getTime();
    const uploadKey = `page-bulk-export-${timeStamp}.zip`;
    const extension = format === PageBulkExportFormat.pdf ? 'pdf' : 'md';

    const pagesReadable = this.getPageReadable(basePagePath);
    const zipArchiver = this.setUpZipArchiver();
    const pagesWritable = await this.getPageWritable(zipArchiver, extension);
    const bufferToPartSizeTransform = getBufferToFixedSizeTransform(this.partSize);

    // init multipart upload
    // TODO: Create abstract interface IMultipartUploader in https://redmine.weseek.co.jp/issues/135775
    const multipartUploader: IAwsMultipartUploader | undefined = this.crowi?.fileUploadService?.createMultipartUploader(uploadKey);
    try {
      if (multipartUploader == null) {
        throw Error('Multipart upload not available for configured file upload type');
      }
      await multipartUploader.initUpload();
    }
    catch (err) {
      await this.handleExportError(err, multipartUploader);
      return;
    }
    const multipartUploadWritable = this.getMultipartUploadWritable(multipartUploader);

    // Cannot directly pipe from pagesWritable to zipArchiver due to how the 'append' method works.
    // Hence, execution of two pipelines is required.
    pipeline(pagesReadable, pagesWritable, err => this.handleExportError(err, multipartUploader));
    pipeline(zipArchiver, bufferToPartSizeTransform, multipartUploadWritable, err => this.handleExportError(err, multipartUploader));
  }

  async handleExportError(err: Error | null, multipartUploader: IAwsMultipartUploader | undefined): Promise<void> {
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
  private async getPageWritable(zipArchiver: Archiver, extension: string): Promise<Writable> {
    // Create a browser instance
    const browser = await puppeteer.launch();

    return new Writable({
      objectMode: true,
      write: async(page: PageDocument, encoding, callback) => {
        try {
          const revision = page.revision;

          if (revision != null && isPopulated(revision)) {
            const body = extension === PageBulkExportFormat.pdf ? (await this.convertMdToPdf(revision.body, browser)) : revision.body;
            const pathNormalized = normalizePath(page.path);
            // Since archiver does not provide a proper way to back pressure at the moment, use the _queue property as a workaround
            // ref: https://github.com/archiverjs/node-archiver/issues/611
            const { _queue } = zipArchiver.append(body, { name: `${pathNormalized}.${extension}` }) as ArchiverWithQueue;
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
      final: async(callback) => {
        zipArchiver.finalize();
        await browser.close();
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

  private getMultipartUploadWritable(multipartUploader: IAwsMultipartUploader): Writable {
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
      async final(callback) {
        try {
          await multipartUploader.completeUpload();
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
    });
  }

  private async convertMdToPdf(md: string, browser: Browser): Promise<Buffer> {
    const htmlString = (await remark()
      .use(html)
      .process(md))
      .toString();
    // Create a new page
    const page = await browser.newPage();

    await page.setContent(htmlString, { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('screen');
    const result = await page.pdf({
      margin: {
        top: '100px', right: '50px', bottom: '100px', left: '50px',
      },
      printBackground: true,
      format: 'A4',
    });

    return result;
  }

}

// eslint-disable-next-line import/no-mutable-exports
export let pageBulkExportService: PageBulkExportService | undefined; // singleton instance
export default function instanciate(crowi): void {
  pageBulkExportService = new PageBulkExportService(crowi);
}
