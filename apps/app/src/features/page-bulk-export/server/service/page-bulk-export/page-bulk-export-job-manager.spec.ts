import { Readable } from 'stream';
import { finished } from 'stream/promises';

import type { HydratedDocument } from 'mongoose';

import { configManager } from '~/server/service/config-manager';

import type { PageBulkExportJobDocument } from '../../models/page-bulk-export-job';

import { BulkExportJobExpiredError, BulkExportJobRestartedError } from './errors';
import { PageBulkExportJobManager } from './page-bulk-export-job-manager';

describe('PageBulkExportJobManager', () => {
  let pageBulkExportServiceMock;
  let jobManager: PageBulkExportJobManager;

  beforeAll(() => {
    vi.spyOn(configManager, 'getConfig').mockImplementation((namespace, key) => {
      if (namespace === 'crowi' && key === 'app:pageBulkExportParallelExecLimit') {
        return 3;
      }
      return undefined; // or whatever the default return value should be
    });
  });

  beforeEach(() => {
    pageBulkExportServiceMock = {
      executePageBulkExportJob: vi.fn(),
    };
    jobManager = new PageBulkExportJobManager(pageBulkExportServiceMock);
  });

  describe('canExecuteNextJob', () => {
    it('should return true if jobs in progress are less than the limit', () => {
      // act, assert
      expect(jobManager.canExecuteNextJob()).toBe(true);
    });

    it('should return false if jobs in progress exceed the limit', () => {
      // arrange
      jobManager.jobsInProgress = {
        job1: { stream: undefined },
        job2: { stream: undefined },
        job3: { stream: undefined },
      };

      // act, assert
      expect(jobManager.canExecuteNextJob()).toBe(false);
    });
  });

  describe('getJobInProgress', () => {
    it('should return the info of job in progress', () => {
      // arrange
      const jobId = 'job1';
      jobManager.jobsInProgress[jobId] = { stream: undefined };

      // act, assert
      expect(jobManager.getJobInProgress(jobId)).toEqual({ stream: undefined });
    });

    it('should return undefined if job is not in progress', () => {
      // arrange
      const jobId = 'job1';

      // act, assert
      expect(jobManager.getJobInProgress(jobId)).toBeUndefined();
    });
  });

  describe('addJob', () => {
    it('should add the job to jobsInProgress if under the parallelExecLimit', () => {
      // arrange
      const job = { _id: 'job1' } as HydratedDocument<PageBulkExportJobDocument>;
      expect(jobManager.jobQueue.length).toBe(0);

      // act
      jobManager.addJob(job, { endpoint: '/test/endpoint' });

      // assert
      expect(jobManager.jobQueue.length).toBe(0);
      expect(jobManager.jobsInProgress[job._id.toString()]).toEqual({ stream: undefined });
      expect(pageBulkExportServiceMock.executePageBulkExportJob).toHaveBeenCalledWith(job, { endpoint: '/test/endpoint' });
    });

    it('should queue the job if the parallelExecLimit is reached', () => {
      // arrange
      jobManager.jobsInProgress = {
        job1: { stream: undefined },
        job2: { stream: undefined },
        job3: { stream: undefined },
      };
      const job = { _id: 'job2' } as HydratedDocument<PageBulkExportJobDocument>;
      expect(jobManager.jobQueue.length).toBe(0);

      // act
      jobManager.addJob(job);

      // assert
      expect(jobManager.jobQueue.length).toBe(1);
      expect(jobManager.jobQueue[0]).toEqual({ job });
      expect(pageBulkExportServiceMock.executePageBulkExportJob).not.toHaveBeenCalled();
    });
  });

  describe('updateJobStream', () => {
    it('should set a new stream when there are no streams executing for the job', () => {
      // arrange
      const jobId = 'job1';
      const mockStream = new Readable();
      jobManager.jobsInProgress[jobId] = { stream: undefined };

      // act
      jobManager.updateJobStream(jobId, mockStream);

      // assert
      expect(jobManager.jobsInProgress[jobId].stream).toBe(mockStream);
    });

    it('should set a new stream when previous stream is finished', async() => {
      // arrange
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
      jobManager.addJob({ _id: jobId } as HydratedDocument<PageBulkExportJobDocument>);

      // act
      jobManager.updateJobStream(jobId, oldStream);

      // assert
      expect(oldStream.readableEnded).toBe(true);
      jobManager.updateJobStream(jobId, newStream);
      expect(jobManager.getJobInProgress(jobId)?.stream).toBe(newStream);
    });

    it('should destroy non-finished stream with an error before setting a new stream', () => {
      // arrange
      const jobId = 'job1';
      const oldStream = vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.destroy = vi.fn();
        return stream;
      })();
      const newStream = new Readable();
      const destroySpy = vi.spyOn(oldStream, 'destroy');
      jobManager.addJob({ _id: jobId } as HydratedDocument<PageBulkExportJobDocument>);
      jobManager.updateJobStream(jobId, oldStream);

      // act
      jobManager.updateJobStream(jobId, newStream);
      expect(destroySpy).toHaveBeenCalledWith(expect.any(Error));

      // assert
      expect(jobManager.getJobInProgress(jobId)?.stream).toBe(newStream);
    });

    it('should destroy the new stream with BulkExportJobExpiredError if job is not in progress', () => {
      // arrange
      const jobId = 'job1';
      const newStream = vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.destroy = vi.fn();
        return stream;
      })();
      const destroySpy = vi.spyOn(newStream, 'destroy');

      // act
      jobManager.updateJobStream(jobId, newStream);

      // assert
      expect(destroySpy).toHaveBeenCalledWith(expect.any(BulkExportJobExpiredError));
    });
  });

  describe('removeJobInProgressAndQueueNextJob', () => {
    it('should remove the job in progress and queue the next job', () => {
      // arrange
      const jobId = 'job1';
      const mockStream = vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.destroy = vi.fn();
        return stream;
      })();
      vi.spyOn(mockStream, 'destroy');
      const nextJob = { _id: 'job2' } as HydratedDocument<PageBulkExportJobDocument>;
      jobManager.jobsInProgress[jobId] = { stream: mockStream };
      jobManager.jobQueue.push({ job: nextJob });
      expect(jobManager.jobQueue.length).toBe(1);

      // act
      jobManager.removeJobInProgressAndQueueNextJob(jobId);

      // assert
      expect(jobManager.jobQueue.length).toBe(0);
      expect(mockStream.destroy).toHaveBeenCalledWith(expect.any(BulkExportJobExpiredError));
      expect(jobManager.jobsInProgress[jobId]).toBeUndefined();
      expect(jobManager.jobsInProgress[nextJob._id.toString()]).toEqual({ stream: undefined });
      expect(pageBulkExportServiceMock.executePageBulkExportJob).toHaveBeenCalledWith(nextJob, undefined);
    });

    it('should destroy the stream with a BulkExportJobRestartedError if job was restarted', () => {
      // arrange
      const jobId = 'job1';
      const mockStream = vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.destroy = vi.fn();
        return stream;
      })();
      vi.spyOn(mockStream, 'destroy');
      jobManager.jobsInProgress[jobId] = { stream: mockStream };

      // act
      jobManager.removeJobInProgressAndQueueNextJob(jobId, true);

      // assert
      expect(mockStream.destroy).toHaveBeenCalledWith(expect.any(BulkExportJobRestartedError));
      expect(jobManager.jobsInProgress[jobId]).toBeUndefined();
    });
  });
});
