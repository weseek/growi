export class DuplicateBulkExportJobError extends Error {

  constructor() {
    super('Duplicate bulk export job is in progress');
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
