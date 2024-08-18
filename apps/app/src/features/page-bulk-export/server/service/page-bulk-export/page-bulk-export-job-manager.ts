import type { Readable } from 'stream';

import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

import { BulkExportJobExpiredError, BulkExportJobRestartedError } from './errors';

interface JobInProgress {
  id: string;
  stream: Readable | undefined;
}

class PageBulkExportJobManager {

  jobsInProgress: JobInProgress[] = [];

  updateJobStream(jobId: ObjectIdLike, stream: Readable): void {
    const jobInProgress = this.jobsInProgress.find(job => job.id === jobId.toString());
    if (jobInProgress != null) {
      jobInProgress.stream = stream;
    }
  }

  removeJobInProgress(jobId: ObjectIdLike, isJobRestarted = false): void {
    const jobInProgress = this.jobsInProgress.find(job => job.id === jobId.toString());
    if (jobInProgress == null) return;

    if (jobInProgress.stream != null) {
      if (isJobRestarted) {
        jobInProgress.stream.destroy(new BulkExportJobRestartedError());
      }
      else {
        jobInProgress.stream.destroy(new BulkExportJobExpiredError());
      }
    }
    this.jobsInProgress = this.jobsInProgress.filter(job => job.id !== jobId);
  }

}
