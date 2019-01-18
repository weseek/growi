const logger = require('@alias/logger')('growi:service:fileUploaderGridfs');
const mongoose = require('mongoose');
const util = require('util');

module.exports = function(crowi) {
  'use strict';

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

  // create promisified method
  AttachmentFile.promisifiedWrite = util.promisify(AttachmentFile.write).bind(AttachmentFile);

  // delete a file
  lib.deleteFile = async function(fileId, filePath) {
    logger.debug('File deletion: ' + fileId);
    const file = await getFile(filePath);
    const id = file.id;
    AttachmentFile.unlinkById(id, function(error, unlinkedAttachment) {
      if (error) {
        throw new Error(error);
      }
    });
    // clearCache(fileId);
  };

  /**
   * get size of data uploaded files using (Promise wrapper)
   */
  const getCollectionSize = () => {
    return new Promise((resolve, reject) => {
      Chunks.collection.stats((err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.size);
      });
    });
  };

  /**
   * chech storage for fileUpload reaches MONGO_GRIDFS_TOTAL_LIMIT (for gridfs)
   */
  lib.checkCapacity = async(uploadFileSize) => {
    // skip checking if env var is undefined
    if (process.env.MONGO_GRIDFS_TOTAL_LIMIT == null) {
      return true;
    }

    const usingFilesSize = await getCollectionSize();
    return (+process.env.MONGO_GRIDFS_TOTAL_LIMIT > usingFilesSize + +uploadFileSize);
  };

  lib.uploadFile = async function(fileStream, attachment) {
    logger.debug(`File uploading: fileName=${attachment.fileName}`);

    return AttachmentFile.promisifiedWrite(
      {
        filename: attachment.fileName,
        contentType: attachment.fileFormat
      },
      fileStream);
  };

  /**
   * Find data substance
   *
   * @param {Attachment} attachment
   * @return {stream.Readable} readable stream
   */
  lib.findDeliveryFile = async function(attachment) {
    const attachmentFile = await AttachmentFile.findOne({ filename: attachment.fileName });

    if (attachmentFile == null) {
      throw new Error(`Any AttachmentFile that relate to the Attachment (${attachment._id.toString()}) does not exist in GridFS`);
    }

    // return stream.Readable
    return AttachmentFile.readById(attachmentFile._id);
  };

  return lib;
};
