/**
 * fileUploader
 */

var aws = require('aws-sdk');
var config = require('config');

module.exports = {
  // deleteFile: function(filePath, callback) {
  //   // TODO 実装する
  // },
  uploadFile: function(filePath, contentType, fileStream, options, callback) {
    var awsConfig = config.aws;
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
  },
  generateS3FillUrl: function(filePath) {
    var awsConfig = config.aws;
    var url = 'https://' + awsConfig.bucket +'.s3.amazonaws.com/' + filePath;

    return url;
  }
};
