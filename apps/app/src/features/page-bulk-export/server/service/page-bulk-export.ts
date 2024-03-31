import type { Readable } from 'stream';
import { Writable, pipeline } from 'stream';

import { type IPage, isPopulated } from '@growi/core';
import { normalizePath } from '@growi/core/dist/utils/path-utils';
import type { Archiver } from 'archiver';
import archiver from 'archiver';
import type { QueueObject } from 'async';
import mongoose from 'mongoose';

import type { PageModel, PageDocument } from '~/server/models/page';
import type { IAwsMultipartUploader } from '~/server/service/file-uploader/aws/multipart-upload';
import loggerFactory from '~/utils/logger';


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

  async bulkExportWithBasePagePath(basePagePath: string): Promise<void> {
    const timeStamp = (new Date()).getTime();
    const uploadKey = `page-bulk-export-${timeStamp}.zip`;

    const pageReadable = this.getPageReadable(basePagePath);
    const zipArchiver = this.setUpZipArchiver();
    const pagesWritable = this.getPageWritable(zipArchiver);

    // init multipart upload
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
    pipeline(pageReadable, pagesWritable, err => this.handleExportError(err, multipartUploader));
    pipeline(zipArchiver, multipartUploadWritable, err => this.handleExportError(err, multipartUploader));
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

  private getMultipartUploadWritable(multipartUploader: IAwsMultipartUploader): Writable {
    let partNumber = 1;
    // Buffer to store stream data before upload. When the buffer is full, it will be uploaded as a part.
    let buffer = Buffer.alloc(this.partSize);
    let filledBufferSize = 0;

    return new Writable({
      write: async(chunk: Buffer, encoding, callback) => {
        try {
          let offset = 0;
          while (offset < chunk.length) {
            // The data size to add to buffer.
            // - If the remaining chunk size is smaller than the remaining buffer size:
            //     - Add all of the remaining chunk to buffer => dataSize is the remaining chunk size
            // - If the remaining chunk size is larger than the remaining buffer size:
            //     - Fill the buffer, and upload => dataSize is the remaining buffer size
            //     - The remaining chunk after upload will be added to buffer in the next iteration
            const dataSize = Math.min(this.partSize - filledBufferSize, chunk.length - offset);
            // Add chunk data to buffer
            chunk.copy(buffer, filledBufferSize, offset, offset + dataSize);
            filledBufferSize += dataSize;

            // When buffer reaches partSize, upload
            if (filledBufferSize === this.partSize) {
              // eslint-disable-next-line no-await-in-loop
              await multipartUploader.uploadPart(buffer, partNumber);
              // Reset buffer after upload
              buffer = Buffer.alloc(this.partSize);
              filledBufferSize = 0;
              partNumber += 1;
            }

            offset += dataSize;
          }
        }
        catch (err) {
          callback(err);
          return;
        }

        callback();
      },
      async final(callback) {
        try {
          if (filledBufferSize > 0) {
            const finalPart = Buffer.alloc(filledBufferSize);
            buffer.copy(finalPart, 0, 0, filledBufferSize);
            await multipartUploader.uploadPart(finalPart, partNumber);
          }
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

}

// eslint-disable-next-line import/no-mutable-exports
export let pageBulkExportService: PageBulkExportService | undefined; // singleton instance
export default function instanciate(crowi): void {
  pageBulkExportService = new PageBulkExportService(crowi);
}
