import type { Bucket, File } from '@google-cloud/storage';

import loggerFactory from '~/utils/logger';

import axios from 'src/utils/axios';

const logger = loggerFactory('growi:services:fileUploaderGcs:multipartUploader');

enum UploadStatus {
  BEFORE_INIT,
  IN_PROGRESS,
  COMPLETED,
  ABORTED
}

// Create abstract interface IMultipartUploader in https://redmine.weseek.co.jp/issues/135775
export interface IGcsMultipartUploader {
  initUpload(): Promise<void>;
  uploadPart(body: Buffer, partNumber: number, maxPartSize?: number): Promise<void>;
  completeUpload(): Promise<void>;
  abortUpload(): Promise<void>;
  uploadId: string;
  getUploadedFileSize(): Promise<number>;
}

/**
 * Class for uploading files to GCS using multipart upload.
 * Create instance from GcsFileUploader class.
 * Each instance can only be used for one multipart upload, and cannot be reused once completed.
 * TODO: Enable creation of uploader of inturrupted uploads: https://redmine.weseek.co.jp/issues/78040
 */
export class GcsMultipartUploader implements IGcsMultipartUploader {

  private uploadKey: string;

  private _uploadId: string | undefined; // URL of GCS resumable upload

  private file: File;

  private currentStatus: UploadStatus = UploadStatus.BEFORE_INIT;

  private _uploadedFileSize = 0;

  // ref: https://cloud.google.com/storage/docs/performing-resumable-uploads?hl=en#chunked-upload
  private readonly minPartSize = 256 * 1024; // 256KB

  private readonly maxPartSize: number;

  constructor(bucket: Bucket, uploadKey: string, maxPartSize: number) {
    this.validateUploadPartSize(maxPartSize);
    this.maxPartSize = maxPartSize;
    this.uploadKey = uploadKey;
    this.file = bucket.file(this.uploadKey);
  }

  get uploadId(): string {
    if (this._uploadId == null) throw Error('UploadId is empty');
    return this._uploadId;
  }

  async initUpload(): Promise<void> {
    this.validateUploadStatus(UploadStatus.BEFORE_INIT);

    const [uploadUrl] = await this.file.createResumableUpload();

    this._uploadId = uploadUrl;
    this.currentStatus = UploadStatus.IN_PROGRESS;
    logger.info(`Multipart upload initialized. Upload key: ${this.uploadKey}`);
  }

  async uploadPart(part: Buffer, partNumber: number): Promise<void> {
    this.validateUploadStatus(UploadStatus.IN_PROGRESS);
    this.validatePartSize(part.length);

    if (part.length === this.maxPartSize) {
      await this.uploadChunk(part);
    }
    else if (this.minPartSize < part.length && part.length < this.maxPartSize) {
      const numOfMinPartSize = Math.floor(part.length / this.minPartSize);
      const minPartSizeMultiplePartChunk = part.slice(0, numOfMinPartSize * this.minPartSize);
      const lastPartChunk = part.slice(numOfMinPartSize * this.minPartSize);

      await this.uploadChunk(minPartSizeMultiplePartChunk);
      await this.uploadChunk(lastPartChunk, true);
    }
    else if (part.length < this.minPartSize) {
      await this.uploadChunk(part, true);
    }
  }

  async completeUpload(): Promise<void> {
    this.validateUploadStatus(UploadStatus.IN_PROGRESS);

    // Send a request to complete the upload, in case the last uploadPart request did not request completion.
    await axios.put(this.uploadId, {
      headers: {
        'Content-Range': `bytes */${this._uploadedFileSize}`,
      },
    });
    this.currentStatus = UploadStatus.COMPLETED;
    logger.info(`Multipart upload completed. Upload key: ${this.uploadKey}`);
  }

  async abortUpload(): Promise<void> {
    this.validateUploadStatus(UploadStatus.IN_PROGRESS);

    try {
      await axios.delete(this.uploadId);
    }
    catch (e) {
      if (e.response?.status !== 499) {
        throw e;
      }
    }
    this.currentStatus = UploadStatus.ABORTED;
    logger.info(`Multipart upload aborted. Upload key: ${this.uploadKey}`);
  }

  async getUploadedFileSize(): Promise<number> {
    if (this.currentStatus === UploadStatus.COMPLETED) {
      const [metadata] = await this.file.getMetadata();
      this._uploadedFileSize = metadata.size;
    }
    return this._uploadedFileSize;
  }

  private uploadChunk = async(_part, isLastUpload = false) => {
    this.validateUploadPartSize(_part.length);

    const range = isLastUpload
      ? `bytes ${this._uploadedFileSize}-${this._uploadedFileSize + _part.length - 1}/${this._uploadedFileSize + _part.length}`
      : `bytes ${this._uploadedFileSize}-${this._uploadedFileSize + _part.length - 1}/*`;

    try {
      await axios.put(this.uploadId, _part, {
        headers: {
          'Content-Range': `${range}`,
        },
      });
    }
    catch (e) {
      if (e.response?.status !== 308) {
        throw e;
      }
    }
    this._uploadedFileSize += _part.length;
  };

  // If part size is larger than the minimal part size, it is required to be a multiple of the minimal part size
  // ref: https://cloud.google.com/storage/docs/performing-resumable-uploads?hl=en#chunked-upload
  private validateUploadPartSize(uploadPartSize: number) {
    if (uploadPartSize > this.minPartSize && uploadPartSize % this.minPartSize !== 0) throw Error(`uploadPartSize must be a multiple of ${this.minPartSize}`);
  }

  private validatePartSize(partSize) {
    if (partSize > this.maxPartSize) throw Error(`partSize must be less than or equal to ${this.maxPartSize}`);
  }

  private validateUploadStatus(desiredStatus: UploadStatus): void {
    if (desiredStatus === this.currentStatus) return;

    let errMsg: string | null = null;

    if (this.currentStatus === UploadStatus.COMPLETED) {
      errMsg = 'Multipart upload has already been completed';
    }

    if (this.currentStatus === UploadStatus.ABORTED) {
      errMsg = 'Multipart upload has been aborted';
    }

    // currentStatus is IN_PROGRESS or BEFORE_INIT

    if (this.currentStatus === UploadStatus.IN_PROGRESS && desiredStatus === UploadStatus.BEFORE_INIT) {
      errMsg = 'Multipart upload has already been initiated';
    }

    if (this.currentStatus === UploadStatus.BEFORE_INIT && desiredStatus === UploadStatus.IN_PROGRESS) {
      errMsg = 'Multipart upload not initiated';
    }

    if (errMsg != null) {
      logger.error(errMsg);
      throw Error(errMsg);
    }
  }

}
