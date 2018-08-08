// crowi-fileupload-aws

module.exports = function(crowi) {
  'use strict';

  var aws = require('aws-sdk')
    , fs = require('fs')
    , path = require('path')
    , debug = require('debug')('growi:service:fileUploaderAws')
    , lib = {}
    , getAwsConfig = function() {
      var config = crowi.getConfig();
      return {
        accessKeyId: config.crowi['aws:accessKeyId'],
        secretAccessKey: config.crowi['aws:secretAccessKey'],
        region: config.crowi['aws:region'],
        bucket: config.crowi['aws:bucket']
      };
    };

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

  lib.generateUrl = function(filePath) {
    var awsConfig = getAwsConfig()
      , url = 'https://' + awsConfig.bucket +'.s3.amazonaws.com/' + filePath;

    return url;
  };

  lib.findDeliveryFile = function(fileId, filePath) {
    var cacheFile = lib.createCacheFileName(fileId);

    return new Promise((resolve, reject) => {
      debug('find delivery file', cacheFile);
      if (!lib.shouldUpdateCacheFile(cacheFile)) {
        return resolve(cacheFile);
      }

      var loader = require('https');

      var fileStream = fs.createWriteStream(cacheFile);
      var fileUrl = lib.generateUrl(filePath);
      debug('Load attachement file into local cache file', fileUrl, cacheFile);
      loader.get(fileUrl, function(response) {
        response.pipe(fileStream, { end: false });
        response.on('end', () => {
          fileStream.end();
          resolve(cacheFile);
        });
      });
    });
  };

  lib.clearCache = function(fileId) {
    const cacheFile = lib.createCacheFileName(fileId);

    (new Promise((resolve, reject) => {
      fs.unlink(cacheFile, (err) => {
        if (err) {
          debug('Failed to delete cache file', err);
          // through
        }

        resolve();
      });
    })).then(data => {
      // success
    }).catch(err => {
      debug('Failed to delete cache file (file may not exists).', err);
      // through
    });
  };

  // private
  lib.createCacheFileName = function(fileId) {
    return path.join(crowi.cacheDir, `attachment-${fileId}`);
  };

  // private
  lib.shouldUpdateCacheFile = function(filePath) {
    try {
      var stats = fs.statSync(filePath);

      if (!stats.isFile()) {
        debug('Cache file not found or the file is not a regular fil.');
        return true;
      }

      if (stats.size <= 0) {
        debug('Cache file found but the size is 0');
        return true;
      }
    }
    catch (e) {
      // no such file or directory
      debug('Stats error', e);
      return true;
    }

    return false;
  };

  return lib;
};

