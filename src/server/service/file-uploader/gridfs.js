// crowi-fileupload-gridFS

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('growi:service:fileUploadergridfs')
  var logger = require('@alias/logger')('growi:routes:attachment')
  var mongoose = require('mongoose');
  var path = require('path');
  var fs = require('fs');
  var lib = {};
  var Attachment = crowi.model('Attachment');
  var AttachmentFile = {};

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

  lib.uploadFile = async function(filePath, contentType, fileStream, options) {
    debug('File uploading: ' + filePath);
    await WriteFile(filePath, contentType, fileStream);
  };

  /**
   * write file with GridFS (Promise wrapper)
   */
  const WriteFile = (filePath, contentType, fileStream) => {
    return new Promise((resolve, reject) => {
      AttachmentFile.write({
        filename: filePath,
        contentType: contentType
      }, fileStream,
      function(error, createdFile) {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  };

  lib.getFileData = async function(filePath) {
    const file = await getFile(filePath);
    const id = file.id;
    const contentType = file.contentType;
    const data = await readFileData(id);
    return {
      data,
      contentType
    };
  };

  /**
   * get file from MongoDB (Promise wrapper)
   */
  const getFile = (filePath) => {
    return new Promise((resolve, reject) => {
      AttachmentFile.findOne({
        filename: filePath
      }, function(err, file) {
        if (err) {
          reject(err);
        }
        resolve(file);
      });
    });
  };

  /**
   * read File in MongoDB (Promise wrapper)
   */
  const readFileData = (id) => {
    return new Promise((resolve, reject) => {
      let buf;
      const stream = AttachmentFile.readById(id);
      stream.on('error', function(error) {
        reject(error);
      });
      stream.on('data', function(data) {
        if (buf) {
          buf = Buffer.concat([buf, data]);
        }
        else {
          buf = data;
        }
      });
      stream.on('close', function() {
        debug('GridFS readstream closed');
        resolve(buf);
      });
    });
  };

  lib.findDeliveryFile = async function(fileId, filePath) {
    const cacheFile = createCacheFileName(fileId);
    debug('Load attachement file into local cache file', cacheFile);
    const fileStream = fs.createWriteStream(cacheFile);
    const file = await getFile(filePath);
    const id = file.id;
    const data = await readFileData(id);
    fileStream.write(data);
    return cacheFile;
  };

  const createCacheFileName = (fileId) => {
    return path.join(crowi.cacheDir, `attachment-${fileId}`);
  };

  lib.generateUrl = function(filePath) {
    return `/${filePath}`;
  };

  return lib;
};
