// crowi-fileupload-gridFS

module.exports = function(crowi) {
  'use strict';

  const debug = require('debug')('growi:service:fileUploaderGridfs');
  const mongoose = require('mongoose');
  const path = require('path');
  const fs = require('fs');
  const lib = {};

  // instantiate mongoose-gridfs
  const gridfs = require('mongoose-gridfs')({
    collection: 'attachmentFiles',
    model: 'AttachmentFile',
    mongooseConnection: mongoose.connection
  });

  // obtain a model
  const AttachmentFile = gridfs.model;
  const Chunks = mongoose.model('Chunks', gridfs.schema, 'attachmentFiles.chunks');

  // delete a file
  lib.deleteFile = async function(fileId, filePath) {
    debug('File deletion: ' + fileId);
    const file = await getFile(filePath);
    const id = file.id;
    AttachmentFile.unlinkById(id, function(error, unlinkedAttachment) {
      if (error) {
        throw new Error(error);
      }
    });
    clearCache(fileId);
  };

  const clearCache = (fileId) => {
    const cacheFile = createCacheFileName(fileId);
    const stats = fs.statSync(crowi.cacheDir);
    if (stats.isFile(`attachment-${fileId}`)) {
      fs.unlink(cacheFile, (err) => {
        if (err) {
          throw new Error('fail to delete cache file', err);
        }
      });
    }
  };

  /**
   * get size of data uploaded files using (Promise wrapper)
   */
  lib.getCollectionSize = () => {
    return new Promise((resolve, reject) => {
      Chunks.collection.stats((err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.size);
      });
    });
  };

  lib.uploadFile = async function(filePath, contentType, fileStream, options) {
    debug('File uploading: ' + filePath);
    await writeFile(filePath, contentType, fileStream);
  };

  /**
   * write file to MongoDB with GridFS (Promise wrapper)
   */
  const writeFile = (filePath, contentType, fileStream) => {
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
    const buf = await readFileData(id);
    await writeCacheFile(fileStream, buf);
    return cacheFile;
  };

  const createCacheFileName = (fileId) => {
    return path.join(crowi.cacheDir, `attachment-${fileId}`);
  };

  /**
   * write cache file (Promise wrapper)
   */
  const writeCacheFile = (fileStream, data) => {
    return new Promise((resolve, reject) => {
      fileStream.write(data);
      resolve();
    });
  };

  lib.generateUrl = function(filePath) {
    return `/${filePath}`;
  };

  return lib;
};
