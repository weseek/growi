import type { HydratedDocument } from 'mongoose';

import type { PageBulkExportJobDocument } from '../../models/page-bulk-export-job';

export class DuplicateBulkExportJobError extends Error {

  duplicateJob: HydratedDocument<PageBulkExportJobDocument>;

  constructor(duplicateJob: HydratedDocument<PageBulkExportJobDocument>) {
    super('Duplicate bulk export job is in progress');
    this.duplicateJob = duplicateJob;
  }

}

export class BulkExportJobExpiredError extends Error {

  constructor() {
    super('Bulk export job has expired');
  }

}

export class BulkExportJobRestartedError extends Error {

  constructor() {
    super('Bulk export job has restarted');
  }

}
