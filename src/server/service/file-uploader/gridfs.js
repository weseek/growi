// crowi-fileupload-gridFS

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('growi:service:fileUploaderLocal')
  var mongoose = require('mongoose');
  var path = require('path');
  var fs = require('fs');
  var lib = {};
  var AttachmentFile = {};
  const express = require('express');
  const router = express.Router();

  // instantiate mongoose-gridfs
  var gridfs = require('mongoose-gridfs')({
    collection: 'attachmentFiles',
    model: 'AttachmentFile',
    mongooseConnection: mongoose.connection
  });

  // obtain a model
  AttachmentFile = gridfs.model;

  // // delete a file
  // lib.deleteFile = async function(fileId, filePath) {
  //   debug('File deletion: ' + fileId);
  //   await AttachmentFile.unlinkById(fileId, function(error, unlinkedAttachment) {
  //     if (error) {
  //       throw new Error(error);
  //     }
  //   });
  // };

  // create or save a file
  lib.uploadFile = async function(filePath, contentType, fileStream, options) {
    debug('File uploading: ' + filePath);
    await AttachmentFile.write({filename: filePath, contentType: contentType}, fileStream,
      function(error, createdFile) {
        if (error) {
          throw new Error('Failed to upload ' + createdFile + 'to gridFS', error);
        }
        return createdFile._id;
      });
  };

  lib.findDeliveryFile = function(fileId, filePath) {
    const cacheFile = lib.createCacheFileName(fileId);

    debug('find delivery file', cacheFile);
    if (!lib.shouldUpdateCacheFile(cacheFile)) {
      return cacheFile;
    }

    const loader = require('https');

    const fileStream = fs.createWriteStream(cacheFile);
    const fileUrl = lib.generateUrl(filePath);
    debug('Load attachement file into local cache file', fileUrl, cacheFile);
    loader.get(fileUrl, function(response) {
      response.pipe(fileStream, {
        end: false
      });
      response.on('end', () => {
        fileStream.end();
        return cacheFile;
      });
    });
  };

  // private
  lib.createCacheFileName = function(fileId) {
    return path.join(crowi.cacheDir, `attachment-${fileId}`);
  };

  // private
  lib.shouldUpdateCacheFile = function(filePath) {
    try {
      const stats = fs.statSync(filePath);

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


  lib.generateUrl = function(filePath) {
    const url = 'http://localhost:3000/_api/attachments.getMongo';
    return url;
  };

  return lib;
};
