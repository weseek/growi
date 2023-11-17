import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommandOutput,
  ListObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Response } from 'express';
import urljoin from 'url-join';

import type { IAttachmentDocument } from '~/server/models/attachment';
import loggerFactory from '~/utils/logger';

import { configManager } from '../config-manager';

import { AbstractFileUploader, type SaveFileParam } from './file-uploader';


const logger = loggerFactory('growi:service:fileUploaderAws');

/**
 * File metadata in storage
 * TODO: mv this to "./uploader"
 */
interface FileMeta {
  name: string;
  size: number;
}

type AwsCredential = {
  accessKeyId: string,
  secretAccessKey: string
}
type AwsConfig = {
  credentials: AwsCredential,
  region: string,
  endpoint: string,
  bucket: string,
  forcePathStyle?: boolean
}

// TODO: rewrite this module to be a type-safe implementation
class AwsFileUploader extends AbstractFileUploader {

  /**
   * @inheritdoc
   */
  override isValidUploadSettings(): boolean {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  override saveFile(param: SaveFileParam) {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  override deleteFiles() {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  override respond(res: Response, attachment: IAttachmentDocument): void {
    throw new Error('Method not implemented.');
  }

}

module.exports = (crowi) => {
  const lib = new AwsFileUploader(crowi);

  const getAwsConfig = (): AwsConfig => {
    return {
      credentials: {
        accessKeyId: configManager.getConfig('crowi', 'aws:s3AccessKeyId'),
        secretAccessKey: configManager.getConfig('crowi', 'aws:s3SecretAccessKey'),
      },
      region: configManager.getConfig('crowi', 'aws:s3Region'),
      endpoint: configManager.getConfig('crowi', 'aws:s3CustomEndpoint'),
      bucket: configManager.getConfig('crowi', 'aws:s3Bucket'),
      forcePathStyle: configManager.getConfig('crowi', 'aws:s3CustomEndpoint') != null, // s3ForcePathStyle renamed to forcePathStyle in v3
    };
  };

  const S3Factory = (): S3Client => {
    const config = getAwsConfig();
    return new S3Client(config);
  };

  const getFilePathOnStorage = (attachment) => {
    if (attachment.filePath != null) {
      return attachment.filePath;
    }

    const dirName = (attachment.page != null)
      ? 'attachment'
      : 'user';
    const filePath = urljoin(dirName, attachment.fileName);

    return filePath;
  };

  const isFileExists = async(s3: S3Client, params) => {
    try {
      await s3.send(new HeadObjectCommand(params));
    }
    catch (err) {
      if (err != null && err.code === 'NotFound') {
        return false;
      }
      throw err;
    }
    return true;
  };

  lib.isValidUploadSettings = function() {
    return configManager.getConfig('crowi', 'aws:s3AccessKeyId') != null
      && configManager.getConfig('crowi', 'aws:s3SecretAccessKey') != null
      && (
        configManager.getConfig('crowi', 'aws:s3Region') != null
          || configManager.getConfig('crowi', 'aws:s3CustomEndpoint') != null
      )
      && configManager.getConfig('crowi', 'aws:s3Bucket') != null;
  };

  lib.canRespond = function() {
    return !configManager.getConfig('crowi', 'aws:referenceFileWithRelayMode');
  };

  (lib as any).respond = async function(res, attachment) {
    if (!lib.getIsUploadable()) {
      throw new Error('AWS is not configured.');
    }
    const temporaryUrl = attachment.getValidTemporaryUrl();
    if (temporaryUrl != null) {
      return res.redirect(temporaryUrl);
    }

    const s3 = S3Factory();
    const awsConfig = getAwsConfig();
    const filePath = getFilePathOnStorage(attachment);
    const lifetimeSecForTemporaryUrl = configManager.getConfig('crowi', 'aws:lifetimeSecForTemporaryUrl');

    // issue signed url (default: expires 120 seconds)
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property
    const params = {
      Bucket: awsConfig.bucket,
      Key: filePath,
    };
    const signedUrl = await getSignedUrl(s3, new GetObjectCommand(params), { expiresIn: lifetimeSecForTemporaryUrl });


    res.redirect(signedUrl);

    try {
      return attachment.cashTemporaryUrlByProvideSec(signedUrl, lifetimeSecForTemporaryUrl);
    }
    catch (err) {
      logger.error(err);
    }

  };

  (lib as any).deleteFile = async function(attachment) {
    const filePath = getFilePathOnStorage(attachment);
    return (lib as any).deleteFileByFilePath(filePath);
  };

  (lib as any).deleteFiles = async function(attachments) {
    if (!lib.getIsUploadable()) {
      throw new Error('AWS is not configured.');
    }
    const s3 = S3Factory();
    const awsConfig = getAwsConfig();

    const filePaths = attachments.map((attachment) => {
      return { Key: getFilePathOnStorage(attachment) };
    });

    const totalParams = {
      Bucket: awsConfig.bucket,
      Delete: { Objects: filePaths },
    };
    return s3.send(new DeleteObjectsCommand(totalParams));
  };

  (lib as any).deleteFileByFilePath = async function(filePath) {
    if (!lib.getIsUploadable()) {
      throw new Error('AWS is not configured.');
    }
    const s3 = S3Factory();
    const awsConfig = getAwsConfig();

    const params = {
      Bucket: awsConfig.bucket,
      Key: filePath,
    };

    // check file exists
    const isExists = await isFileExists(s3, params);
    if (!isExists) {
      logger.warn(`Any object that relate to the Attachment (${filePath}) does not exist in AWS S3`);
      return;
    }

    return s3.send(new DeleteObjectCommand(params));
  };

  (lib as any).uploadAttachment = async function(fileStream, attachment) {
    if (!lib.getIsUploadable()) {
      throw new Error('AWS is not configured.');
    }

    logger.debug(`File uploading: fileName=${attachment.fileName}`);

    const s3 = S3Factory();
    const awsConfig = getAwsConfig();

    const filePath = getFilePathOnStorage(attachment);
    const params = {
      Bucket: awsConfig.bucket,
      ContentType: attachment.fileFormat,
      Key: filePath,
      Body: fileStream,
      ACL: 'public-read',
    };

    return s3.send(new PutObjectCommand(params));
  };

  lib.saveFile = async function({ filePath, contentType, data }) {
    const s3 = S3Factory();
    const awsConfig = getAwsConfig();

    const params = {
      Bucket: awsConfig.bucket,
      ContentType: contentType,
      Key: filePath,
      Body: data,
      ACL: 'public-read',
    };

    return s3.send(new PutObjectCommand(params));
  };

  (lib as any).findDeliveryFile = async function(attachment) {
    if (!lib.getIsReadable()) {
      throw new Error('AWS is not configured.');
    }

    const s3 = S3Factory();
    const awsConfig = getAwsConfig();
    const filePath = getFilePathOnStorage(attachment);

    const params = {
      Bucket: awsConfig.bucket,
      Key: filePath,
    };

    // check file exists
    const isExists = await isFileExists(s3, params);
    if (!isExists) {
      throw new Error(`Any object that relate to the Attachment (${filePath}) does not exist in AWS S3`);
    }

    let stream : GetObjectCommandOutput['Body'];
    try {
      stream = (await s3.send(new GetObjectCommand(params))).Body;
    }
    catch (err) {
      logger.error(err);
      throw new Error(`Coudn't get file from AWS for the Attachment (${attachment._id.toString()})`);
    }

    // return stream.Readable
    return stream;
  };

  (lib as any).checkLimit = async function(uploadFileSize) {
    const maxFileSize = configManager.getConfig('crowi', 'app:maxFileSize');
    const totalLimit = configManager.getConfig('crowi', 'app:fileUploadTotalLimit');
    return lib.doCheckLimit(uploadFileSize, maxFileSize, totalLimit);
  };

  /**
   * List files in storage
   */
  (lib as any).listFiles = async function() {
    if (!lib.getIsReadable()) {
      throw new Error('AWS is not configured.');
    }

    const files: FileMeta[] = [];
    const s3 = S3Factory();
    const awsConfig = getAwsConfig();
    const params = {
      Bucket: awsConfig.bucket,
    };
    let shouldContinue = true;
    let nextMarker: string | undefined;

    // handle pagination
    while (shouldContinue) {
      // eslint-disable-next-line no-await-in-loop
      const { Contents = [], IsTruncated, NextMarker } = await s3.send(new ListObjectsCommand({
        ...params,
        Marker: nextMarker,
      }));
      files.push(...(
        Contents.map(({ Key, Size }) => ({
          name: Key as string,
          size: Size as number,
        }))
      ));

      if (!IsTruncated) {
        shouldContinue = false;
        nextMarker = undefined;
      }
      else {
        nextMarker = NextMarker;
      }
    }

    return files;
  };

  return lib;
};
