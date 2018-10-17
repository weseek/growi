// crowi-fileupload-gridFS

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('growi:service:fileUploaderLocal')
  var fs = require('fs');
  var mongoose = require('mongoose');
  var gridfs = require('gridfs-stream');
  var path = require('path');
  var lib = {};
  var AttachmentFile = {};

  // instantiate mongoose-gridfs
  var gridfs = require('mongoose-gridfs')({
    collection: 'attachments',
    model: 'AttachmentFile',
    mongooseConnection: mongoose.connection
  });

  // obtain a model
  AttachmentFile= gridfs.model;

  // delete a file
  lib.deleteFile = function (fileId, filePath) {
    debug('File deletion: ' + fileId);
    return new Promise(function (resolve, reject) {
      AttachmentFile.unlinkById(fileId, function (error, unlinkedAttachment) {
        resolve();
      });
    });
  };

  // create or save a file
  lib.uploadFile = function (filePath, contentType, fileStream, options) {
    return new Promise(function (resolve, reject) {
      AttachmentFile.write({
        filename: filePath,
        contentType: contentType
      },
      fs.createReadStream(fileStream.path),
      function (error, createdFile) {
        debug('Failed to upload ' + createdFile + 'to gridFS', error);
        resolve(createdFile._id);
      });
    });
  };

  lib.generateUrl = function (filePath) {
    return path.posix.join('/uploads', filePath);
  };

  return lib;
};
