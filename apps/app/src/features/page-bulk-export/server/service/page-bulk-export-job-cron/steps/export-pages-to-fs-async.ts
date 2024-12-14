import fs from 'fs';
import path from 'path';
import { Writable, pipeline } from 'stream';

import { isPopulated } from '@growi/core';
import { getParentPath, normalizePath } from '@growi/core/dist/utils/path-utils';
import remark from 'remark';
import html from 'remark-html';


import { PageBulkExportFormat, PageBulkExportJobStatus } from '~/features/page-bulk-export/interfaces/page-bulk-export';

import type { IPageBulkExportJobCronService } from '..';
import type { PageBulkExportJobDocument } from '../../../models/page-bulk-export-job';
import type { PageBulkExportPageSnapshotDocument } from '../../../models/page-bulk-export-page-snapshot';
import PageBulkExportPageSnapshot from '../../../models/page-bulk-export-page-snapshot';

async function convertMdToHtml(md: string, remarkHtml): Promise<string> {
  const htmlString = (await remarkHtml
    .process(md))
    .toString();

  return htmlString;
}

/**
 * Get a Writable that writes the page body temporarily to fs
 */
function getPageWritable(this: IPageBulkExportJobCronService, pageBulkExportJob: PageBulkExportJobDocument): Writable {
  const isHtmlPath = pageBulkExportJob.format === PageBulkExportFormat.pdf;
  const format = pageBulkExportJob.format === PageBulkExportFormat.pdf ? 'html' : pageBulkExportJob.format;
  const outputDir = this.getTmpOutputDir(pageBulkExportJob, isHtmlPath);
  // define before the stream starts to avoid creating multiple instances
  const remarkHtml = remark().use(html);
  return new Writable({
    objectMode: true,
    write: async(page: PageBulkExportPageSnapshotDocument, encoding, callback) => {
      try {
        const revision = page.revision;

        if (revision != null && isPopulated(revision)) {
          const markdownBody = revision.body;
          const pathNormalized = `${normalizePath(page.path)}.${format}`;
          const fileOutputPath = path.join(outputDir, pathNormalized);
          const fileOutputParentPath = getParentPath(fileOutputPath);

          await fs.promises.mkdir(fileOutputParentPath, { recursive: true });
          if (pageBulkExportJob.format === PageBulkExportFormat.md) {
            await fs.promises.writeFile(fileOutputPath, markdownBody);
          }
          else {
            const htmlString = await convertMdToHtml(markdownBody, remarkHtml);
            await fs.promises.writeFile(fileOutputPath, htmlString);
          }
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
      try {
        // If the format is md, the export process ends here.
        // If the format is pdf, pdf conversion in pdf-converter has to finish.
        if (pageBulkExportJob.format === PageBulkExportFormat.md) {
          pageBulkExportJob.status = PageBulkExportJobStatus.uploading;
          await pageBulkExportJob.save();
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

/**
 * Export pages to the file system before compressing and uploading to the cloud storage.
 * The export will resume from the last exported page if the process was interrupted.
 */
export function exportPagesToFsAsync(this: IPageBulkExportJobCronService, pageBulkExportJob: PageBulkExportJobDocument): void {
  const findQuery = pageBulkExportJob.lastExportedPagePath != null ? {
    pageBulkExportJob,
    path: { $gt: pageBulkExportJob.lastExportedPagePath },
  } : { pageBulkExportJob };
  const pageSnapshotsReadable = PageBulkExportPageSnapshot
    .find(findQuery)
    .populate('revision').sort({ path: 1 }).lean()
    .cursor({ batchSize: this.pageBatchSize });

  const pagesWritable = getPageWritable.bind(this)(pageBulkExportJob);

  this.setStreamInExecution(pageBulkExportJob._id, pageSnapshotsReadable);

  pipeline(pageSnapshotsReadable, pagesWritable, (err) => {
    this.handleError(err, pageBulkExportJob);
  });
}
