/**
 * fileUploader
 */


module.exports = function(app) {
  'use strict';

  var aws = require('aws-sdk')
    , debug = require('debug')('crowi:lib:fileUploader')
    , config = app.set('config')
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

  // lib.deleteFile = function(filePath, callback) {
  //   // TODO 実装する
  // };

  lib.uploadFile = function(filePath, contentType, fileStream, options, callback) {
    var awsConfig = getAwsConfig();

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

    s3.putObject(params, function(err, data) {
      callback(err, data);
    });
  };

  lib.generateS3FillUrl = function(filePath) {
    var awsConfig = getAwsConfig();
    var url = 'https://' + awsConfig.bucket +'.s3.amazonaws.com/' + filePath;

    return url;
  };

  return lib;
};
