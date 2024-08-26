import type { Readable } from 'stream';

import type { HydratedDocument } from 'mongoose';

import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

import type { PageBulkExportJobDocument } from '../../models/page-bulk-export-job';

import { BulkExportJobExpiredError, BulkExportJobRestartedError } from './errors';

import type { ActivityParameters, IPageBulkExportService } from '.';

export class PageBulkExportJobManager {

  pageBulkExportService: IPageBulkExportService;

  parallelExecLimit = 5;

  // contains jobs being executed and it's information
  // the key is the _id of PageBulkExportJob and the value contains the stream of the job
  jobsInProgress: {
    [key: string]: { stream: Readable | undefined };
  } = {};

  // jobs waiting to be executed in order
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

  /**
   * Add a job to the queue or execute it if the number of jobs in progress is less than the limit
   * @param job job to add or execute
   * @param activityParameters parameters to record user activity
   */
  addJob(job: HydratedDocument<PageBulkExportJobDocument>, activityParameters?: ActivityParameters): void {
    if (this.canExecuteNextJob()) {
      this.jobsInProgress[job.id.toString()] = { stream: undefined };
      this.pageBulkExportService.executePageBulkExportJob(job, activityParameters);
    }
    else {
      this.jobQueue.push(job);
    }
  }

  /**
   * Update the info of which stream is being executed for a job
   * @param jobId id of job to update
   * @param stream the new stream being executed for the job
   */
  updateJobStream(jobId: ObjectIdLike, stream: Readable): void {
    const jobInProgress = this.getJobInProgress(jobId);
    if (jobInProgress != null) {
      if (jobInProgress.stream != null && !jobInProgress.stream.readableEnded) {
        jobInProgress.stream.destroy(new Error('Stream not finished before next stream started'));
      }
      jobInProgress.stream = stream;
    }
    else {
      // job was terminated beforehand, so destroy the stream
      stream.destroy(new BulkExportJobExpiredError());
    }
  }

  /**
   * Remove a job in execution and queue the next job if there are any
   * @param jobId id of job to remove
   * @param isJobRestarted whether or not the job was restarted
   */
  removeJobInProgressAndQueueNextJob(jobId: ObjectIdLike, isJobRestarted = false): void {
    this.removeJobInProgress(jobId, isJobRestarted);

    if (this.jobQueue.length > 0) {
      while (this.canExecuteNextJob()) {
        const nextJob = this.jobQueue.shift();
        if (nextJob != null) {
          this.jobsInProgress[nextJob.id.toString()] = { stream: undefined };
          this.pageBulkExportService.executePageBulkExportJob(nextJob);
        }
      }
    }
  }

  /**
   * Remove a job in execution and destroy it's stream process
   * @param jobId id of job to remove
   * @param isJobRestarted whether or not the job was restarted
   */
  private removeJobInProgress(jobId: ObjectIdLike, isJobRestarted = false): void {
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

}
