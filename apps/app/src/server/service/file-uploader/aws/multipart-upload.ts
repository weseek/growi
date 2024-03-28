import {
  CreateMultipartUploadCommand, UploadPartCommand, type S3Client, CompleteMultipartUploadCommand, AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:services:fileUploaderAws:multipartUploader');

enum UploadStatus {
  BEFORE_INIT,
  IN_PROGRESS,
  COMPLETED,
  ABORTED
}

export interface IAwsMultipartUploader {
  initUpload(): Promise<void>;
  uploadPart(body: Buffer, partNumber: number): Promise<void>;
  completeUpload(): Promise<void>;
  abortUpload(): Promise<void>;
}

/**
 * Class for uploading files to S3 using multipart upload.
 * Create instance from AwsFileUploader class.
 * Each instance can only be used for one multipart upload, and cannot be reused once completed.
 * TODO: Enable creation of uploader of inturrupted uploads: https://redmine.weseek.co.jp/issues/78040
 */
export class AwsMultipartUploader implements IAwsMultipartUploader {

  private bucket: string;

  private uploadKey: string;

  private uploadId: string | undefined;

  private s3Client: S3Client;

  private parts: { PartNumber: number; ETag: string | undefined; }[] = [];

  private currentStatus: UploadStatus = UploadStatus.BEFORE_INIT;

  constructor(s3Client: S3Client, bucket: string, uploadKey: string) {
    this.s3Client = s3Client;
    this.bucket = bucket;
    this.uploadKey = uploadKey;
  }

  async initUpload(): Promise<void> {
    this.validateUploadStatus(UploadStatus.BEFORE_INIT);

    const response = await this.s3Client.send(new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: this.uploadKey,
    }));
    this.uploadId = response.UploadId;
    this.currentStatus = UploadStatus.IN_PROGRESS;
    logger.info(`Multipart upload initialized. Upload key: ${this.uploadKey}`);
  }

  async uploadPart(body: Buffer, partNumber: number): Promise<void> {
    this.validateUploadStatus(UploadStatus.IN_PROGRESS);

    const uploadMetaData = await this.s3Client.send(new UploadPartCommand({
      Body: body,
      Bucket: this.bucket,
      Key: this.uploadKey,
      PartNumber: partNumber,
      UploadId: this.uploadId,
    }));

    this.parts.push({
      PartNumber: partNumber,
      ETag: uploadMetaData.ETag,
    });
  }

  async completeUpload(): Promise<void> {
    this.validateUploadStatus(UploadStatus.IN_PROGRESS);

    await this.s3Client.send(new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: this.uploadKey,
      UploadId: this.uploadId,
      MultipartUpload: {
        Parts: this.parts,
      },
    }));
    this.currentStatus = UploadStatus.COMPLETED;
    logger.info(`Multipart upload completed. Upload key: ${this.uploadKey}`);
  }

  async abortUpload(): Promise<void> {
    this.validateUploadStatus(UploadStatus.IN_PROGRESS);

    await this.s3Client.send(new AbortMultipartUploadCommand({
      Bucket: this.bucket,
      Key: this.uploadKey,
      UploadId: this.uploadId,
    }));
    this.currentStatus = UploadStatus.ABORTED;
    logger.info(`Multipart upload aborted. Upload key: ${this.uploadKey}`);
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
