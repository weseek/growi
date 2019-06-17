const logger = require('@alias/logger')('growi:service:fileUploaderAws');

const axios = require('axios');
const urljoin = require('url-join');
const aws = require('aws-sdk');

module.exports = function(crowi) {
  const Uploader = require('./uploader');
  const lib = new Uploader(crowi.configManager);

  function getAwsConfig() {
    const config = crowi.getConfig();
    return {
      accessKeyId: config.crowi['aws:accessKeyId'],
      secretAccessKey: config.crowi['aws:secretAccessKey'],
      region: config.crowi['aws:region'],
      bucket: config.crowi['aws:bucket'],
    };
  }

  function S3Factory(isUploadable) {
    const awsConfig = getAwsConfig();

    if (!isUploadable) {
      throw new Error('AWS is not configured.');
    }

    aws.config.update({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: awsConfig.region,
    });

    return new aws.S3();
  }

  function getFilePathOnStorage(attachment) {
    if (attachment.filePath != null) { // backward compatibility for v3.3.x or below
      return attachment.filePath;
    }

    const dirName = (attachment.page != null)
      ? 'attachment'
      : 'user';
    const filePath = urljoin(dirName, attachment.fileName);

    return filePath;
  }

  lib.deleteFile = async function(attachment) {
    const filePath = getFilePathOnStorage(attachment);
    return lib.deleteFileByFilePath(filePath);
  };

  lib.deleteFileByFilePath = async function(filePath) {
    const s3 = S3Factory(this.getIsUploadable());
    const awsConfig = getAwsConfig();

    const params = {
      Bucket: awsConfig.bucket,
      Key: filePath,
    };

    return s3.deleteObject(params).promise();
  };

  lib.uploadFile = function(fileStream, attachment) {
    logger.debug(`File uploading: fileName=${attachment.fileName}`);

    const s3 = S3Factory(this.getIsUploadable());
    const awsConfig = getAwsConfig();

    const filePath = getFilePathOnStorage(attachment);
    const params = {
      Bucket: awsConfig.bucket,
      ContentType: attachment.fileFormat,
      Key: filePath,
      Body: fileStream,
      ACL: 'public-read',
    };

    return s3.upload(params).promise();
  };

  /**
   * Find data substance
   *
   * @param {Attachment} attachment
   * @return {stream.Readable} readable stream
   */
  lib.findDeliveryFile = async function(attachment) {
    // construct url
    const awsConfig = getAwsConfig();
    const baseUrl = `https://${awsConfig.bucket}.s3.amazonaws.com`;
    const url = urljoin(baseUrl, getFilePathOnStorage(attachment));

    let response;
    try {
      response = await axios.get(url, { responseType: 'stream' });
    }
    catch (err) {
      logger.error(err);
      throw new Error(`Coudn't get file from AWS for the Attachment (${attachment._id.toString()})`);
    }

    // return stream.Readable
    return response.data;
  };

  /**
   * check the file size limit
   *
   * In detail, the followings are checked.
   * - per-file size limit (specified by MAX_FILE_SIZE)
   */
  lib.checkLimit = async(uploadFileSize) => {
    const maxFileSize = crowi.configManager.getConfig('crowi', 'app:maxFileSize');
    return { isUploadable: uploadFileSize <= maxFileSize, errorMessage: 'File size exceeds the size limit per file' };
  };

  return lib;
};
