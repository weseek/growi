import { Writable } from 'stream';

import { type IPage, isPopulated } from '@growi/core';
import { normalizePath } from '@growi/core/dist/utils/path-utils';
import type { Archiver } from 'archiver';
import archiver from 'archiver';
import mongoose from 'mongoose';

import type { PageModel, PageDocument } from '~/server/models/page';
import type { IAwsMultipartUploader } from '~/server/service/file-uploader/aws/multipart-upload';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:services:PageBulkExportService');

const streamToPromise = require('stream-to-promise');

const sleep = (msec: number): Promise<void> => new Promise(resolve => setTimeout(resolve, msec));

class PageBulkExportService {

  crowi: any;

  zipArchiver: Archiver;

  // multipart upload part size
  partSize = 5 * 1024 * 1024; // 5MB

  constructor(crowi) {
    this.crowi = crowi;
  }

  async bulkExportWithBasePagePath(basePagePath: string): Promise<void> {
    const timeStamp = (new Date()).getTime();
    const uploadKey = `page-bulk-export-${timeStamp}.zip`;

    const pageReadableStream = this.getPageReadableStream(basePagePath);
    const zipArchiver = this.setUpZipArchiver();
    const pagesWritable = this.getPageWritable(zipArchiver);

    try {
      const multipartUploadWritable = await this.getMultipartUploadWritable(uploadKey);

      zipArchiver.pipe(multipartUploadWritable);
      pageReadableStream.pipe(pagesWritable);

      console.time('pageBulkExport');
      await streamToPromise(multipartUploadWritable);
      console.timeEnd('pageBulkExport');
    }
    catch (err) {
      logger.error(err);
    }
  }

  /**
   * Get a ReadableStream of all the pages under the specified path, including the root page.
   */
  private getPageReadableStream(basePagePath: string) {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const { PageQueryBuilder } = Page;

    const builder = new PageQueryBuilder(Page.find())
      .addConditionToListOnlyDescendants(basePagePath);

    return builder
      .query
      .populate('revision')
      .lean()
      .cursor({ batchSize: 100 }); // convert to stream
  }

  /**
   * Get a Writable that writes the page body to a zip file
   */
  private getPageWritable(zipArchiver: Archiver) {
    let totalTime = 0;
    let documentsProcessed = 0;

    return new Writable({
      objectMode: true,
      write: async(page: PageDocument, encoding, callback) => {
        const startTime = performance.now();

        try {
          const revision = page.revision;

          if (revision != null && isPopulated(revision)) {
            const markdownBody = revision.body;
            // write to zip
            const pathNormalized = normalizePath(page.path);
            zipArchiver.append(markdownBody, { name: `${pathNormalized}.md` });
          }

          documentsProcessed++;
          if (documentsProcessed % 100 === 0) { // Assuming batchSize is 100
            console.log(`Batch retrieved. Documents processed: ${documentsProcessed}`);
            // await sleep(10000);
          }
        }
        catch (err) {
          logger.error(err);
          throw Error('Failed to export page tree');
        }

        callback();

        const endTime = performance.now();

        const elapsedTime = endTime - startTime;
        totalTime += elapsedTime;
      },
      final: (callback) => {
        zipArchiver.finalize();
        callback();

        console.log('Total time of zip write stream: ', totalTime);
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
    // good practice to catch this error explicitly
    zipArchiver.on('error', (err) => { throw err });

    return zipArchiver;
  }

  private async getMultipartUploadWritable(uploadKey: string): Promise<Writable> {
    const multipartUploader: IAwsMultipartUploader | undefined = this.crowi?.fileUploadService?.createMultipartUploader(uploadKey);

    if (multipartUploader == null) {
      throw Error('Multipart upload not available for configured file upload type');
    }

    let partNumber = 1;
    // Buffer to store stream data before upload. When the buffer is full, it will be uploaded as a part.
    let part = Buffer.alloc(this.partSize);
    let filledPartSize = 0;

    await multipartUploader.initUpload();
    logger.info(`Multipart upload initialized. Upload key: ${uploadKey}`);

    let totalTime = 0;

    let chunkCount = 0;

    return new Writable({
      write: async(chunk: Buffer, encoding, callback) => {
        chunkCount++;
        if (chunkCount % 100 === 0) {
          console.log('chunk is being read. size:', chunk.length);
          chunkCount = 0;
        }
        const startTime = performance.now();

        let offset = 0;
        while (offset < chunk.length) {
          // The data size to add to buffer.
          // - If the remaining chunk size is smaller than the remaining buffer size:
          //     - Add all of the remaining chunk to buffer => dataSize is the remaining chunk size
          // - If the remaining chunk size is larger than the remaining buffer size:
          //     - Fill the buffer, and upload => dataSize is the remaining buffer size
          //     - The remaining chunk after upload will be added to buffer in the next iteration
          const dataSize = Math.min(this.partSize - filledPartSize, chunk.length - offset);
          // Add chunk data to buffer
          // buffer = Buffer.concat([buffer, chunk.slice(offset, offset + dataSize)]);
          chunk.copy(part, filledPartSize, offset, offset + dataSize);
          filledPartSize += dataSize;

          // When buffer reaches partSize, upload
          if (filledPartSize === this.partSize) {
            // eslint-disable-next-line no-await-in-loop
            await multipartUploader.uploadPart(part, partNumber);
            // Reset buffer after upload
            part = Buffer.alloc(this.partSize);
            filledPartSize = 0;
            partNumber += 1;
          }

          offset += dataSize;
        }

        callback();

        const endTime = performance.now();

        const elapsedTime = endTime - startTime;
        totalTime += elapsedTime;
      },
      async final(callback) {
        if (filledPartSize > 0) {
          const finalPart = Buffer.alloc(filledPartSize);
          part.copy(finalPart, 0, 0, filledPartSize);
          await multipartUploader.uploadPart(finalPart, partNumber);
        }
        await multipartUploader.completeUpload();
        logger.info(`Multipart upload completed. Upload key: ${uploadKey}`);
        callback();

        console.log('Total time of mutipart upload stream: ', totalTime);
      },
    });
  }

}

// eslint-disable-next-line import/no-mutable-exports
export let pageBulkExportService: PageBulkExportService | undefined; // singleton instance
export default function instanciate(crowi): void {
  pageBulkExportService = new PageBulkExportService(crowi);
}
