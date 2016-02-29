// crowi-fileupload-aws

module.exports = function(crowi) {
  'use strict';

  var aws = require('aws-sdk')
    , debug = require('debug')('crowi:lib:fileUploaderAws')
    , Promise = require('bluebird')
    , Config = crowi.model('Config')
    , config = crowi.getConfig()
    , lib = {}
    , getAwsConfig = function() {
        return {
          accessKeyId: config.crowi['aws:accessKeyId'],
          secretAccessKey: config.crowi['aws:secretAccessKey'],
          region: config.crowi['aws:region'],
          bucket: config.crowi['aws:bucket']
        };
      };

  lib.deleteFile = function(filePath) {
    return new Promise(function(resolve, reject) {
      debug('Unsupported file deletion.');
      resolve('TODO: ...');
    });
  };

  lib.uploadFile = function(filePath, contentType, fileStream, options) {
    var awsConfig = lib.getAwsConfig();
    if (!Config.isUploadable(config)) {
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

  lib.generateUrl = function(filePath) {
    var awsConfig = lib.getAwsConfig()
      , url = 'https://' + awsConfig.bucket +'.s3.amazonaws.com/' + filePath;

    return url;
  };

  return lib;
};

