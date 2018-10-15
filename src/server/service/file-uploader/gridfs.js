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

  // create or save a file
  lib.uploadFile = function (filePath, contentType, fileStream, options) {
    return new Promise(function (resolve, reject) {
      AttachmentFile.write({
        filename: 'test1.jpg',
        contentType: contentType
      },
      fs.createReadStream(fileStream.path),
      function (error, createdFile) {
        debug('Failed to upload ' + createdFile + 'to gridFS', error);
        resolve(createdFile);
      });
    });
  };

  // for larger file size
  // read a file and receive a stream
  // var stream = Attachment.readById(objectid);

  // for smaller file size
  // // read a file and receive a buffer
  // Attachment.readById(objectid, function (error, buffer) {
  //   debug('Failed to read a file with ' + buffer, error);
  // });

  // // remove file details and its content from gridfs
  // Attachment.unlinkById(objectid, function (error, unlinkedAttachment) {
  //   debug('Failed to remove ' + unlinkedAttachment + 'in gridFS', error);
  // });

  lib.generateUrl = function (filePath) {
    return path.posix.join('/uploads', filePath);
  };

  return lib;
};
