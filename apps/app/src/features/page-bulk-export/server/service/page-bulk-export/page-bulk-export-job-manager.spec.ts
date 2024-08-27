import { Readable } from 'stream';
import { finished } from 'stream/promises';

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
      expect(jobManager.jobQueue.length).toBe(1);
      expect(jobManager.jobQueue[0]).toEqual({ job });
      expect(pageBulkExportServiceMock.executePageBulkExportJob).not.toHaveBeenCalled();
    });
  });

  describe('updateJobStream', () => {
    it('should set a new stream when there are no streams executing for the job', () => {
      const jobId = 'job1';
      const mockStream = new Readable();
      jobManager.jobsInProgress[jobId] = { stream: undefined };
      jobManager.updateJobStream(jobId, mockStream);
      expect(jobManager.jobsInProgress[jobId].stream).toBe(mockStream);
    });

    it('should set a new stream when previous stream is finished', async() => {
      const jobId = 'job1';
      const oldStream = new Readable({
        read(size) {
          // End the stream immediately
          this.push(null);
        },
      });
      oldStream.read();
      await finished(oldStream);

      const newStream = vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.destroy = vi.fn();
        return stream;
      })() as unknown as Readable;
      jobManager.addJob({ _id: jobId } as any);
      jobManager.updateJobStream(jobId, oldStream);

      expect(oldStream.readableEnded).toBe(true);
      jobManager.updateJobStream(jobId, newStream);
      expect(jobManager.getJobInProgress(jobId)?.stream).toBe(newStream);
    });

    it('should destroy non-finished stream with an error before setting a new stream', () => {
      const jobId = 'job1';
      const oldStream = vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.destroy = vi.fn();
        return stream;
      })();

      const newStream = new Readable();
      const destroySpy = vi.spyOn(oldStream, 'destroy');
      jobManager.addJob({ _id: jobId } as any);
      jobManager.updateJobStream(jobId, oldStream);

      try {
        jobManager.updateJobStream(jobId, newStream);
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(destroySpy).toHaveBeenCalledWith(expect.any(Error));
      }

      expect(jobManager.getJobInProgress(jobId)?.stream).toBe(newStream);
    });

    it('should destroy the new stream with BulkExportJobExpiredError if job is not in progress', () => {
      const jobId = 'job1';
      const newStream = vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.destroy = vi.fn();
        return stream;
      })();
      const destroySpy = vi.spyOn(newStream, 'destroy');

      jobManager.updateJobStream(jobId, newStream);

      expect(destroySpy).toHaveBeenCalledWith(expect.any(BulkExportJobExpiredError));
    });
  });

  describe('removeJobInProgressAndQueueNextJob', () => {
    it('should remove the job in progress and queue the next job', () => {
      const jobId = 'job1';
      const mockStream = vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.destroy = vi.fn();
        return stream;
      })();
      vi.spyOn(mockStream, 'destroy');

      const nextJob = { _id: 'job2' } as any;

      jobManager.jobsInProgress[jobId] = { stream: mockStream };
      jobManager.jobQueue.push({ job: nextJob });

      jobManager.removeJobInProgressAndQueueNextJob(jobId);

      expect(mockStream.destroy).toHaveBeenCalledWith(expect.any(BulkExportJobExpiredError));
      expect(jobManager.jobsInProgress[jobId]).toBeUndefined();
      expect(jobManager.jobsInProgress[nextJob._id.toString()]).toEqual({ stream: undefined });
      expect(pageBulkExportServiceMock.executePageBulkExportJob).toHaveBeenCalledWith(nextJob, undefined);
    });

    it('should destroy the stream with a BulkExportJobRestartedError if job was restarted', () => {
      const jobId = 'job1';
      const mockStream = vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.destroy = vi.fn();
        return stream;
      })();
      vi.spyOn(mockStream, 'destroy');

      jobManager.jobsInProgress[jobId] = { stream: mockStream };
      jobManager.removeJobInProgressAndQueueNextJob(jobId, true);

      expect(mockStream.destroy).toHaveBeenCalledWith(expect.any(BulkExportJobRestartedError));
      expect(jobManager.jobsInProgress[jobId]).toBeUndefined();
    });
  });
});
