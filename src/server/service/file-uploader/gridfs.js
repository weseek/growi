// crowi-fileupload-gridFS

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('growi:service:fileUploaderLocal')
  var fs = require('fs');
  var mongoose = require('mongoose');
  var lib = {};
  var Attachment = {};

  // // mongoose connect
  // mongoose.connect('mongodb://localhost/test');

  // instantiate mongoose-gridfs
  var gridfs = require('mongoose-gridfs')({
    collection: 'attachments',
    model: 'Attachment',
    mongooseConnection: mongoose.connection
  });

  // obtain a model
  Attachment = gridfs.model;

  // create or save a file
  lib.uploadFile = function (filePath, contentType, fileStream, options) {
    Attachment.write({
      filePath: filePath,
      contentType: contentType
    },
      fs.createReadStream(fileStream.path),
      function (error, createdFile) {
        debug('Failed to upload ' + createdFile + 'to gridFS', error);
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

  return lib;
};

