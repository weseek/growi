// crowi-fileupload-local

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('crowi:lib:fileUploaderLocal')
    , fs = require('fs')
    , path = require('path')
    , mkdir = require('mkdirp')
    , Config = crowi.model('Config')
    , config = crowi.getConfig()
    , lib = {}
    , basePath = path.join(crowi.publicDir, 'uploads'); // TODO: to configurable

  lib.deleteFile = function(fileId, filePath) {
    debug('File deletion: ' + filePath);
    return new Promise(function(resolve, reject) {
      fs.unlink(path.join(basePath, filePath), function(err) {
        if (err) {
          debug(err);
          return reject(err);
        }

        resolve();
      });
    });
  };

  lib.uploadFile = function(filePath, contentType, fileStream, options) {
    debug('File uploading: ' + filePath);
    return new Promise(function(resolve, reject) {
      var localFilePath = path.join(basePath, filePath)
        , dirpath = path.dirname(localFilePath);

      mkdir(dirpath, function(err) {
        if (err) {
          return reject(err);
        }

        var writer = fs.createWriteStream(localFilePath);

        writer.on('error', function(err) {
          reject(err);
        }).on('finish', function() {
          resolve();
        });

        fileStream.pipe(writer);
      });
    });
  };

  lib.generateUrl = function(filePath) {
    return path.join('/uploads', filePath);
  };

  lib.findDeliveryFile = function (fileId, filePath) {
    return Promise.resolve(lib.generateUrl(filePath));
  };

  return lib;
};


