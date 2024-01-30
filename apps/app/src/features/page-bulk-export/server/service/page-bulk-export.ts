import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';

import { isPopulated } from '@growi/core';
import { normalizePath } from '@growi/core/dist/utils/path-utils';
import archiver, { Archiver } from 'archiver';

import { PageModel, PageDocument } from '~/server/models/page';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:services:PageBulkExportService'); // eslint-disable-line no-unused-vars

const streamToPromise = require('stream-to-promise');

class PageBulkExportService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  getPageReadableStream(basePagePath: string) {
    const Page = this.crowi.model('Page') as PageModel;
    const { PageQueryBuilder } = Page;

    const builder = new PageQueryBuilder(Page.find())
      .addConditionToListOnlyDescendants(basePagePath);

    return builder
      .query
      .populate('revision')
      .lean()
      .cursor({ batchSize: 100 }); // convert to stream
  }

  setUpZipArchiver(): Archiver {
    const timeStamp = (new Date()).getTime();
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
    // get pages with descendants as stream
    const pageReadableStream = this.getPageReadableStream(basePagePath);

    const archive = this.setUpZipArchiver();

    const pagesWritable = new Writable({
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

    pageReadableStream.pipe(pagesWritable);

    await streamToPromise(archive);
  }

}

// eslint-disable-next-line import/no-mutable-exports
export let pageBulkExportService: PageBulkExportService | undefined; // singleton instance
export default function instanciate(crowi): void {
  pageBulkExportService = new PageBulkExportService(crowi);
}
