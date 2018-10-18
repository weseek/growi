// crowi-fileupload-gridFS

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('growi:service:fileUploaderLocal')
  var mongoose = require('mongoose');
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
  AttachmentFile = gridfs.model;

  // delete a file
  lib.deleteFile = async function(fileId, filePath) {
    debug('File deletion: ' + fileId);
    await AttachmentFile.unlinkById(fileId, function(error, unlinkedAttachment) {
      if (error) {
        throw new Error(error);
      }
    });
  };

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

  lib.generateUrl = function(filePath) {
    return path.posix.join('/uploads', filePath);
  };

  return lib;
};
