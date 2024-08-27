import { Readable } from 'stream';

import { BulkExportJobExpiredError, BulkExportJobRestartedError } from './errors';
import { PageBulkExportJobManager } from './page-bulk-export-job-manager';

describe('PageBulkExportJobManager', () => {
  let pageBulkExportServiceMock;
  let jobManager: PageBulkExportJobManager;

  beforeEach(() => {
    pageBulkExportServiceMock = {
      executePageBulkExportJob: vi.fn(),
    };
    jobManager = new PageBulkExportJobManager(pageBulkExportServiceMock);
  });

  describe('canExecuteNextJob', () => {
    it('should return true if jobs in progress are less than the limit', () => {
      expect(jobManager.canExecuteNextJob()).toBe(true);
    });

    it('should return false if jobs in progress exceed the limit', () => {
      jobManager.jobsInProgress = {
        job1: { stream: undefined },
        job2: { stream: undefined },
        job3: { stream: undefined },
        job4: { stream: undefined },
        job5: { stream: undefined },
      };
      expect(jobManager.canExecuteNextJob()).toBe(false);
    });
  });

  describe('getJobInProgress', () => {
    it('should return the info of job in progress', () => {
      const jobId = 'job1';
      jobManager.jobsInProgress[jobId] = { stream: undefined };
      expect(jobManager.getJobInProgress(jobId)).toEqual({ stream: undefined });
    });

    it('should return undefined if job is not in progress', () => {
      const jobId = 'job1';
      expect(jobManager.getJobInProgress(jobId)).toBeUndefined();
    });
  });

  describe('addJob', () => {
    it('should add the job to jobsInProgress if under the parallelExecLimit', () => {
      const job = { _id: 'job1' } as any;
      jobManager.addJob(job, { endpoint: '/test/endpoint' });
      expect(jobManager.jobsInProgress[job._id.toString()]).toEqual({ stream: undefined });
      expect(pageBulkExportServiceMock.executePageBulkExportJob).toHaveBeenCalledWith(job, { endpoint: '/test/endpoint' });
    });

    it('should queue the job if the parallelExecLimit is reached', () => {
      jobManager.jobsInProgress = {
        job1: { stream: undefined },
        job2: { stream: undefined },
        job3: { stream: undefined },
        job4: { stream: undefined },
        job5: { stream: undefined },
      };
      const job = { _id: 'job2' } as any;
      jobManager.addJob(job);
      expect(jobManager.jobQueue).toContain({ job });
      expect(pageBulkExportServiceMock.executePageBulkExportJob).not.toHaveBeenCalled();
    });
  });

  describe('updateJobStream', () => {
    it('should update the stream for a job in progress', () => {
      const jobId = 'job1';
      const mockStream = new Readable();
      jobManager.jobsInProgress[jobId] = { stream: undefined };
      jobManager.updateJobStream(jobId, mockStream);
      expect(jobManager.jobsInProgress[jobId].stream).toBe(mockStream);
    });

    it('should destroy the existing stream if it has not finished', () => {
      const jobId = 'job1';
      const existingStream = new Readable();
      const mockStream = new Readable();
      vi.spyOn(existingStream, 'destroy');

      jobManager.jobsInProgress[jobId] = { stream: existingStream };
      jobManager.updateJobStream(jobId, mockStream);

      expect(existingStream.destroy).toHaveBeenCalledWith(new Error('Stream not finished before next stream started'));
      expect(jobManager.jobsInProgress[jobId].stream).toBe(mockStream);
    });

    it('should destroy the new stream if the job is not in progress', () => {
      const jobId = 'job1';
      const mockStream = new Readable();
      vi.spyOn(mockStream, 'destroy');

      jobManager.updateJobStream(jobId, mockStream);
      expect(mockStream.destroy).toHaveBeenCalledWith(expect.any(BulkExportJobExpiredError));
    });
  });

  describe('removeJobInProgressAndQueueNextJob', () => {
    it('should remove the job in progress and queue the next job', () => {
      const jobId = 'job1';
      const mockStream = new Readable();
      vi.spyOn(mockStream, 'destroy');

      const nextJob = { _id: 'job2' } as any;

      jobManager.jobsInProgress[jobId] = { stream: mockStream };
      jobManager.jobQueue.push({ job: nextJob });

      jobManager.removeJobInProgressAndQueueNextJob(jobId);

      expect(mockStream.destroy).toHaveBeenCalledWith(expect.any(BulkExportJobExpiredError));
      expect(jobManager.jobsInProgress[jobId]).toBeUndefined();
      expect(jobManager.jobsInProgress[nextJob._id.toString()]).toEqual({ stream: undefined });
      expect(pageBulkExportServiceMock.executePageBulkExportJob).toHaveBeenCalledWith(nextJob);
    });

    it('should destroy the stream with a BulkExportJobRestartedError if job was restarted', () => {
      const jobId = 'job1';
      const mockStream = new Readable();
      vi.spyOn(mockStream, 'destroy');

      jobManager.jobsInProgress[jobId] = { stream: mockStream };
      jobManager.removeJobInProgressAndQueueNextJob(jobId, true);

      expect(mockStream.destroy).toHaveBeenCalledWith(expect.any(BulkExportJobRestartedError));
      expect(jobManager.jobsInProgress[jobId]).toBeUndefined();
    });
  });
});
