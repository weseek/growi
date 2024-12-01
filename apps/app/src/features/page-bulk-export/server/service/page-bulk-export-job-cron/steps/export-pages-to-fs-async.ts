import fs from 'fs';
import path from 'path';
import { Writable, pipeline } from 'stream';

import { isPopulated } from '@growi/core';
import { getParentPath, normalizePath } from '@growi/core/dist/utils/path-utils';

import { PageBulkExportFormat, PageBulkExportJobStatus } from '~/features/page-bulk-export/interfaces/page-bulk-export';

import type { IPageBulkExportJobCronService } from '..';
import type { PageBulkExportJobDocument } from '../../../models/page-bulk-export-job';
import type { PageBulkExportPageSnapshotDocument } from '../../../models/page-bulk-export-page-snapshot';
import PageBulkExportPageSnapshot from '../../../models/page-bulk-export-page-snapshot';

/**
 * Get a Writable that writes the page body temporarily to fs
 */
function getPageWritable(this: IPageBulkExportJobCronService, pageBulkExportJob: PageBulkExportJobDocument): Writable {
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
    this.handlePipelineError(err, pageBulkExportJob);
  });
}
