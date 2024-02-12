import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';

import { type IPage, isPopulated } from '@growi/core';
import { normalizePath } from '@growi/core/dist/utils/path-utils';
import type { Archiver } from 'archiver';
import archiver from 'archiver';
import mongoose from 'mongoose';
import type { Browser } from 'puppeteer';
import puppeteer from 'puppeteer';
import remark from 'remark';
import html from 'remark-html';

import type { PageModel, PageDocument } from '~/server/models/page';
import loggerFactory from '~/utils/logger';

import { PageBulkExportFormat } from '../../interfaces/page-bulk-export';

const logger = loggerFactory('growi:services:PageBulkExportService');

const streamToPromise = require('stream-to-promise');

class PageBulkExportService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  getPageReadableStream(basePagePath: string) {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const { PageQueryBuilder } = Page;

    const builder = new PageQueryBuilder(Page.find())
      .addConditionToListWithDescendants(basePagePath);

    return builder
      .query
      .populate('revision')
      .lean()
      .cursor({ batchSize: 100 }); // convert to stream
  }

  setUpZipArchiver(format: string): Archiver {
    const timeStamp = (new Date()).getTime();
    const zipFilePath = path.join(__dirname, `${timeStamp}.${format}.zip`);

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

  async bulkExportWithBasePagePath(basePagePath: string, format: string): Promise<void> {
    // get pages with descendants as stream
    const pageReadableStream = this.getPageReadableStream(basePagePath);
    const extension = format === PageBulkExportFormat.pdf ? 'pdf' : 'md';

    const archive = this.setUpZipArchiver(extension);

    // Create a browser instance
    const browser = await puppeteer.launch();

    const pagesWritable = new Writable({
      objectMode: true,
      write: async(page: PageDocument, encoding, callback) => {
        try {
          const revision = page.revision;

          if (revision != null && isPopulated(revision)) {
            const body = format === PageBulkExportFormat.pdf ? (await this.convertMdToPdf(revision.body, browser)) : revision.body;

            // write to zip
            const pathNormalized = normalizePath(page.path);
            archive.append(body, { name: `${pathNormalized}.${extension}` });
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

    await browser.close();
  }

  async convertMdToPdf(md: string, browser: Browser): Promise<Buffer> {
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
