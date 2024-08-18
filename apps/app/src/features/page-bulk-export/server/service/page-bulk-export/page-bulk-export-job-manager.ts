import type { Readable } from 'stream';

import type { HydratedDocument } from 'mongoose';

import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

import type { PageBulkExportJobDocument } from '../../models/page-bulk-export-job';

import { BulkExportJobExpiredError, BulkExportJobRestartedError } from './errors';

import type { ActivityParameters, IPageBulkExportService } from '.';

export class PageBulkExportJobManager {

  pageBulkExportService: IPageBulkExportService;

  parallelExecLimit = 5;

  jobsInProgress: {
    [key: string]: { stream: Readable | undefined };
  } = {};

  jobQueue: HydratedDocument<PageBulkExportJobDocument>[] = [];

  constructor(pageBulkExportService: IPageBulkExportService) {
    this.pageBulkExportService = pageBulkExportService;
  }

  canExecuteNextJob(): boolean {
    return Object.keys(this.jobsInProgress).length < this.parallelExecLimit;
  }

  getJobInProgress(jobId: ObjectIdLike): { stream: Readable | undefined } | undefined {
    return this.jobsInProgress[jobId.toString()];
  }

  addJob(job: HydratedDocument<PageBulkExportJobDocument>, activityParameters?: ActivityParameters): void {
    if (this.canExecuteNextJob()) {
      this.jobsInProgress[job.id.toString()] = { stream: undefined };
      this.pageBulkExportService.executePageBulkExportJob(job, activityParameters);
    }
    else {
      this.jobQueue.push(job);
    }
  }

  updateJobStream(jobId: ObjectIdLike, stream: Readable): void {
    const jobInProgress = this.getJobInProgress(jobId);
    if (jobInProgress != null) {
      jobInProgress.stream = stream;
    }
    else {
      // job was terminated beforehand, so destroy the stream
      stream.destroy(new BulkExportJobExpiredError());
    }
  }

  removeJobInProgress(jobId: ObjectIdLike, isJobRestarted = false): void {
    const jobInProgress = this.getJobInProgress(jobId);
    if (jobInProgress == null) return;

    if (jobInProgress.stream != null) {
      if (isJobRestarted) {
        jobInProgress.stream.destroy(new BulkExportJobRestartedError());
      }
      else {
        jobInProgress.stream.destroy(new BulkExportJobExpiredError());
      }
    }
    delete this.jobsInProgress[jobId.toString()];
  }

  removeJobInProgressAndQueueNextJob(jobId: ObjectIdLike, isJobRestarted = false): void {
    this.removeJobInProgress(jobId, isJobRestarted);

    if (this.jobQueue.length > 0 && this.canExecuteNextJob()) {
      const nextJob = this.jobQueue.shift();
      if (nextJob != null) {
        this.jobsInProgress[nextJob.id.toString()] = { stream: undefined };
        this.pageBulkExportService.executePageBulkExportJob(nextJob);
      }
    }
  }

}
