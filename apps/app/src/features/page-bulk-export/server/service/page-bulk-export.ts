import fs from 'fs';
import path from 'path';
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

class PageBulkExportService {

  crowi: any;

  // multipart upload part size
  partSize = 5 * 1024 * 1024; // 5MB

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * Get a ReadableStream of all the pages under the specified path, including the root page.
   */
  getPageReadableStream(basePagePath: string) {
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
  getPageWritable(archive: Archiver) {
    return new Writable({
      objectMode: true,
      async write(page: PageDocument, encoding, callback) {
        try {
          const revision = page.revision;

          if (revision != null && isPopulated(revision)) {
            const markdownBody = revision.body;
            // write to zip
            const pathNormalized = normalizePath(page.path);
            archive.append(markdownBody, { name: `${pathNormalized}.md` });
          }
        }
        catch (err) {
          logger.error(err);
          throw Error('Failed to export page tree');
        }

        callback();
      },
      final(callback) {
        archive.finalize();
        callback();
      },
    });
  }

  setUpZipArchiver(timeStamp: number): Archiver {
    const zipFilePath = path.join(__dirname, `${timeStamp}.md.zip`);

    const archive = archiver('zip', {
      zlib: { level: 9 }, // maximum compression
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') logger.error(err);
      else throw err;
    });
    // good practice to catch this error explicitly
    archive.on('error', (err) => { throw err });

    // pipe archive data to the file
    const output = fs.createWriteStream(zipFilePath);
    archive.pipe(output);

    return archive;
  }

  async bulkExportWithBasePagePath(basePagePath: string): Promise<void> {
    if (this.crowi?.fileUploadService?.createMultipartUploader == null) {
      throw Error('Multipart upload not available for configured file upload type');
    }
    const timeStamp = (new Date()).getTime();

    const uploadKey = `page-bulk-export-${timeStamp}`;

    // get pages with descendants as stream
    const pageReadableStream = this.getPageReadableStream(basePagePath);

    const archive = this.setUpZipArchiver(timeStamp);

    const pagesWritable = this.getPageWritable(archive);

    const multipartUploadWritable = await this.getMultipartUploadWritable(uploadKey, this.partSize);

    archive.pipe(multipartUploadWritable);
    pageReadableStream.pipe(pagesWritable);

    await streamToPromise(archive);
  }


  async getMultipartUploadWritable(uploadKey: string, partSize: number) {
    const multipartUploader: IAwsMultipartUploader = this.crowi?.fileUploadService?.createMultipartUploader(uploadKey);

    let partNumber = 1;
    let buffer = Buffer.alloc(0);

    await multipartUploader.initUpload();

    return new Writable({
      objectMode: true,
      async write(chunk, encoding, callback) {
        let offset = 0;
        while (offset < chunk.length) {
          const chunkSize = Math.min(partSize - buffer.length, chunk.length - offset);
          buffer = Buffer.concat([buffer, chunk.slice(offset, offset + chunkSize)]);
          if (buffer.length === partSize) {
            // eslint-disable-next-line no-await-in-loop
            await multipartUploader.uploadPart(buffer, partNumber);

            buffer = Buffer.alloc(0);
            partNumber += 1;
          }

          offset += chunkSize;
        }

        callback();
      },
      async final(callback) {
        if (buffer.length > 0) {
          await multipartUploader.uploadPart(buffer, partNumber);
        }
        await multipartUploader.completeUpload();
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
