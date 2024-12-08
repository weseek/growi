import { configManager } from '~/server/service/config-manager';

import { PageBulkExportJobStatus } from '../../../interfaces/page-bulk-export';
import type { PageBulkExportJobDocument } from '../../models/page-bulk-export-job';
import PageBulkExportPageSnapshot from '../../models/page-bulk-export-page-snapshot';

import { BulkExportJobExpiredError } from './errors';

import { PdfCtrlSyncJobStatus202Status, PdfCtrlSyncJobStatusBodyStatus, pdfCtrlSyncJobStatus } from '^/../pdf-converter/dist/client-library';

export async function requestPdfConverter(pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
  const jobCreatedAt = pageBulkExportJob.createdAt;
  if (jobCreatedAt == null) {
    throw new Error('createdAt is not set');
  }

  const exportJobExpirationSeconds = configManager.getConfig('crowi', 'app:bulkExportJobExpirationSeconds');
  const bulkExportJobExpirationDate = new Date(jobCreatedAt.getTime() + exportJobExpirationSeconds * 1000);
  let pdfConvertStatus: PdfCtrlSyncJobStatusBodyStatus = PdfCtrlSyncJobStatusBodyStatus.HTML_EXPORT_IN_PROGRESS;

  const lastExportPagePath = (await PageBulkExportPageSnapshot.findOne({ pageBulkExportJob }).sort({ path: -1 }))?.path;
  if (lastExportPagePath == null) {
    throw new Error('lastExportPagePath is missing');
  }

  if (new Date() > bulkExportJobExpirationDate) {
    throw new BulkExportJobExpiredError();
  }
  try {
    if (pageBulkExportJob.lastExportedPagePath === lastExportPagePath) {
      pdfConvertStatus = PdfCtrlSyncJobStatusBodyStatus.HTML_EXPORT_DONE;
    }

    if (pageBulkExportJob.status === PageBulkExportJobStatus.failed) {
      pdfConvertStatus = PdfCtrlSyncJobStatusBodyStatus.FAILED;
    }

    const res = await pdfCtrlSyncJobStatus({
      jobId: pageBulkExportJob._id.toString(), expirationDate: bulkExportJobExpirationDate.toISOString(), status: pdfConvertStatus,
    }, { baseURL: configManager.getConfig('crowi', 'app:pageBulkExportPdfConverterUrl') });

    if (res.data.status === PdfCtrlSyncJobStatus202Status.PDF_EXPORT_DONE) {
      pageBulkExportJob.status = PageBulkExportJobStatus.uploading;
      await pageBulkExportJob.save();
    }
    else if (res.data.status === PdfCtrlSyncJobStatus202Status.FAILED) {
      throw new Error('PDF export failed');
    }
  }
  catch (err) {
    // Only set as failure when host is ready but failed.
    // If host is not ready, the request should be retried on the next cron execution.
    if (!['ENOTFOUND', 'ECONNREFUSED'].includes(err.code)) {
      throw err;
    }
  }
}
