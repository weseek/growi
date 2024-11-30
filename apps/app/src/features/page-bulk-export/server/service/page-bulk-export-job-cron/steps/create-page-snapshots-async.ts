import mongoose from 'mongoose';
import { createHash } from 'crypto';
import { Writable, pipeline } from 'stream';

import { IPage, getIdForRef, getIdStringForRef } from '@growi/core';

import { PageDocument, PageModel } from "~/server/models/page";
import { PageBulkExportJobStatus } from "~/features/page-bulk-export/interfaces/page-bulk-export";

import { PageBulkExportJobDocument } from "../../../models/page-bulk-export-job";
import PageBulkExportPageSnapshot from '../../../models/page-bulk-export-page-snapshot';
import PageBulkExportJob from '../../../models/page-bulk-export-job';
import { IPageBulkExportJobCronService } from "..";

/**
 * Start a pipeline that creates a snapshot for each page that is to be exported in the pageBulkExportJob.
 * 'revisionListHash' is calulated and saved to the pageBulkExportJob at the end of the pipeline.
 */
export async function createPageSnapshotsAsync(this: IPageBulkExportJobCronService, user, pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
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

      await reuseDuplicateExportIfExists(pageBulkExportJob);
      callback();
    }
  });
  pipeline(pagesReadable, pageSnapshotsWritable, (err) => {
    this.handlePipelineError(err, pageBulkExportJob);
  });
}

async function reuseDuplicateExportIfExists(pageBulkExportJob: PageBulkExportJobDocument) {
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
    await pageBulkExportJob.save();
  }
}
