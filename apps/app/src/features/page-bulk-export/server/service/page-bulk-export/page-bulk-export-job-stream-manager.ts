import type { Readable } from 'stream';

import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

import { BulkExportJobExpiredError } from './errors';

/**
 * Used to keep track of streams currently being executed, and enable destroying them
 */
export class PageBulkExportJobStreamManager {

  private jobStreams: Record<string, Readable> = {};

  addJobStream(jobId: ObjectIdLike, stream: Readable): void {
    this.jobStreams[jobId.toString()] = stream;
  }

  removeJobStream(jobId: ObjectIdLike): void {
    delete this.jobStreams[jobId.toString()];
  }

  destroyJobStream(jobId: ObjectIdLike): void {
    const stream = this.jobStreams[jobId.toString()];
    if (stream != null) {
      stream.destroy(new BulkExportJobExpiredError());
    }
    this.removeJobStream(jobId);
  }

}
