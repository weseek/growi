/**
 * fileUploader
 */


module.exports = function(crowi, app) {
  'use strict';

  var aws = require('aws-sdk')
    , debug = require('debug')('crowi:lib:fileUploader')
    , Promise = require('bluebird')
    , config = crowi.getConfig()
    , lib = {}
    ;

  function getAwsConfig ()
  {
    return {
      accessKeyId: config.crowi['aws:accessKeyId'],
      secretAccessKey: config.crowi['aws:secretAccessKey'],
      region: config.crowi['aws:region'],
      bucket: config.crowi['aws:bucket']
    };
  }

  function isUploadable(awsConfig) {
    if (!awsConfig.accessKeyId ||
        !awsConfig.secretAccessKey ||
        !awsConfig.region ||
        !awsConfig.bucket) {
      return false;
    }

    return true;
  }

  // lib.deleteFile = function(filePath, callback) {
  //   // TODO 実装する
  // };
  //

  lib.uploadFile = function(filePath, contentType, fileStream, options) {
    var awsConfig = getAwsConfig();
    if (!isUploadable(awsConfig)) {
      return new Promise.reject(new Error('AWS is not configured.'));
    }

    aws.config.update({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: awsConfig.region
    });
    var s3 = new aws.S3();

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

  lib.generateS3FileUrl = function(filePath) {
    var awsConfig = getAwsConfig();
    var url = 'https://' + awsConfig.bucket +'.s3.amazonaws.com/' + filePath;

    return url;
  };

  return lib;
};
