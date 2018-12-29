const debug = require('debug')('growi:service:fileUploaderAws');

const urljoin = require('url-join');
const aws = require('aws-sdk');

module.exports = function(crowi) {

  const lib = {};

  function getAwsConfig() {
    const config = crowi.getConfig();
    return {
      accessKeyId: config.crowi['aws:accessKeyId'],
      secretAccessKey: config.crowi['aws:secretAccessKey'],
      region: config.crowi['aws:region'],
      bucket: config.crowi['aws:bucket']
    };
  }

  function S3Factory() {
    const awsConfig = getAwsConfig();
    const Config = crowi.model('Config');
    const config = crowi.getConfig();

    if (!Config.isUploadable(config)) {
      throw new Error('AWS is not configured.');
    }

    aws.config.update({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: awsConfig.region
    });

    return new aws.S3();
  }

  lib.deleteFile = function(fileId, filePath) {
    const s3 = S3Factory();
    const awsConfig = getAwsConfig();

    const params = {
      Bucket: awsConfig.bucket,
      Key: filePath,
    };

    return new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          debug('Failed to delete object from s3', err);
          return reject(err);
        }

        // asynclonousely delete cache
        lib.clearCache(fileId);

        resolve(data);
      });
    });
  };

  lib.uploadFile = function(filePath, contentType, fileStream, options) {
    const s3 = S3Factory();
    const awsConfig = getAwsConfig();

    var params = {Bucket: awsConfig.bucket};
    params.ContentType = contentType;
    params.Key = filePath;
    params.Body = fileStream;
    params.ACL = 'public-read';

    return new Promise(function(resolve, reject) {
      s3.putObject(params, function(err, data) {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });
  };

  /**
   * return local file path string
   */
  lib.findDeliveryFile = async function(attachmentId, filePath) {
    const awsConfig = getAwsConfig();
    const baseUrl = `https://${awsConfig.bucket}.s3.amazonaws.com`;
    const url = urljoin(baseUrl, filePath);

    return url;
  };

  /**
   * chech storage for fileUpload reaches MONGO_GRIDFS_TOTAL_LIMIT (for gridfs)
   */
  lib.checkCapacity = async(uploadFileSize) => {
    return true;
  };

  return lib;
};

