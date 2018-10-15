// crowi-fileupload-gridFS

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('growi:service:fileUploaderLocal')
  var fs = require('fs');
  var mongoose = require('mongoose');
  var gridfs = require('gridfs-stream');
  var path = require('path');
  var basePath = path.posix.join(crowi.publicDir, 'uploads'); // TODO: to configurable

  var lib = {};

  mongoose.connect('mongodb://localhost/growi', {
    useNewUrlParser: true
  });
  mongoose.Promise = global.Promise;
  gridfs.mongo = mongoose.mongo;
  var connection = mongoose.connection;
  connection.on('error', console.error.bind(console, 'connection error:'));

  lib.uploadFile = function (filePath, contentType, fileStream, options) {
    debug('File uploading: ' + filePath);
    return new Promise(function (resolve, reject) {
      // connection.once('open', function () {
      var gfs = gridfs(connection.db);
      var localFilePath = path.posix.join(basePath, filePath),
        dirpath = path.posix.dirname(localFilePath);

      mkdir(dirpath, function (err) {
        if (err) {
          return reject(err);
        }

        var writer = fs.createWriteStream(localFilePath);

        writer.on('error', function (err) {
          reject(err);
        }).on('finish', function () {
          console.log('finish');
        });
      });

      // Writing a file from local to MongoDB
      var writestream = gfs.createWriteStream({ filename: 'test.jpg' });
      fs.createReadStream(filePath).pipe(writestream);
      writestream.on('close', function (file) {
        resolve(file);
      });
    });
    // });
  };
  // // mongoose connect
  // mongoose.connect('mongodb://localhost/test');

  // // instantiate mongoose-gridfs
  // var gridfs = require('mongoose-gridfs')({
  //   collection: 'attachments',
  //   model: 'Attachment',
  //   mongooseConnection: mongoose.connection
  // });

  // // obtain a model
  // Attachment = gridfs.model;

  // // create or save a file
  // lib.uploadFile = function (filePath, contentType, fileStream, options) {
  //   Attachment.write({
  //     filePath: filePath,
  //     contentType: contentType
  //   },
  //     fs.createReadStream(fileStream.path),
  //     function (error, createdFile) {
  //       debug('Failed to upload ' + createdFile + 'to gridFS', error);
  //     });
  // };

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
