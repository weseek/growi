import { Readable } from 'stream';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:fileUploaderGridfs');
const util = require('util');

const mongoose = require('mongoose');

module.exports = function(crowi) {
  const Uploader = require('./uploader');
  const { configManager } = crowi;
  const lib = new Uploader(crowi);
  const COLLECTION_NAME = 'attachmentFiles';
  const CHUNK_COLLECTION_NAME = `${COLLECTION_NAME}.chunks`;

  // instantiate mongoose-gridfs
  const { createModel, GridFSBucket } = require('mongoose-gridfs');
  const AttachmentFile = createModel({
    modelName: COLLECTION_NAME,
    bucketName: COLLECTION_NAME,
    connection: mongoose.connection,
  });

  // Create bucket
  const bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: COLLECTION_NAME,
  });

  // get Collection instance of chunk
  const chunkCollection = mongoose.connection.collection(CHUNK_COLLECTION_NAME);

  // create promisified method
  // Since the findById API (mongoose v7.x.x) doesn't accept callbacks anymore, while gridfs still uses callbacks on findById
  // it needs to be overridden
  // Override gridfs `write` method
  AttachmentFile.promisifiedWrite = async function(file, stream) {
    try {
      const created = await util.promisify(bucket.writeFile).call(bucket, file, stream);
      const attachment = await AttachmentFile.findById(created._id).exec();
      return attachment;
    }
    catch (error) {
      throw new Error('Failed to write attachment to bucket');
    }
  };

  // Override gridfs `unlink` method
  AttachmentFile.promisifiedUnlink = function(attachment) {
    return new Promise(async(resolve, reject) => {
      try {
        await bucket.deleteFile(attachment._id);
        resolve('File deleted successfully');
      }
      catch (err) {
        reject(err);
      }
    });
  };

  lib.isValidUploadSettings = function() {
    return true;
  };

  lib.deleteFile = async function(attachment) {
    let filenameValue = attachment.fileName;

    if (attachment.filePath != null) { // backward compatibility for v3.3.x or below
      filenameValue = attachment.filePath;
    }

    const attachmentFile = await AttachmentFile.findOne({ filename: filenameValue });

    if (attachmentFile == null) {
      logger.warn(`Any AttachmentFile that relate to the Attachment (${attachment._id.toString()}) does not exist in GridFS`);
      return;
    }
    return AttachmentFile.promisifiedUnlink({ _id: attachmentFile._id });
  };

  lib.deleteFiles = async function(attachments) {
    const filenameValues = attachments.map((attachment) => {
      return attachment.fileName;
    });
    const fileIdObjects = await AttachmentFile.find({ filename: { $in: filenameValues } }, { _id: 1 });
    const idsRelatedFiles = fileIdObjects.map((obj) => { return obj._id });

    return Promise.all([
      AttachmentFile.deleteMany({ filename: { $in: filenameValues } }),
      chunkCollection.deleteMany({ files_id: { $in: idsRelatedFiles } }),
    ]);
  };

  /**
   * get size of data uploaded files using (Promise wrapper)
   */
  // const getCollectionSize = () => {
  //   return new Promise((resolve, reject) => {
  //     chunkCollection.stats((err, data) => {
  //       if (err) {
  //         // return 0 if not exist
  //         if (err.errmsg.includes('not found')) {
  //           return resolve(0);
  //         }
  //         return reject(err);
  //       }
  //       return resolve(data.size);
  //     });
  //   });
  // };

  /**
   * check the file size limit
   *
   * In detail, the followings are checked.
   * - per-file size limit (specified by MAX_FILE_SIZE)
   * - mongodb(gridfs) size limit (specified by MONGO_GRIDFS_TOTAL_LIMIT)
   */
  lib.checkLimit = async function(uploadFileSize) {
    const maxFileSize = configManager.getConfig('crowi', 'app:maxFileSize');
    const totalLimit = configManager.getFileUploadTotalLimit();
    return lib.doCheckLimit(uploadFileSize, maxFileSize, totalLimit);
  };

  lib.uploadAttachment = async function(fileStream, attachment) {
    logger.debug(`File uploading: fileName=${attachment.fileName}`);

    return AttachmentFile.promisifiedWrite(
      {
        filename: attachment.fileName,
        contentType: attachment.fileFormat,
      },
      fileStream,
    );
  };

  lib.saveFile = async function({ filePath, contentType, data }) {
    const readable = new Readable();
    readable.push(data);
    readable.push(null); // EOF

    return AttachmentFile.promisifiedWrite(
      {
        filename: filePath,
        contentType,
      },
      readable,
    );
  };

  /**
   * Find data substance
   *
   * @param {Attachment} attachment
   * @return {stream.Readable} readable stream
   */
  lib.findDeliveryFile = async function(attachment) {
    let filenameValue = attachment.fileName;

    if (attachment.filePath != null) { // backward compatibility for v3.3.x or below
      filenameValue = attachment.filePath;
    }

    const attachmentFile = await AttachmentFile.findOne({ filename: filenameValue });

    if (attachmentFile == null) {
      throw new Error(`Any AttachmentFile that relate to the Attachment (${attachment._id.toString()}) does not exist in GridFS`);
    }

    // return stream.Readable
    return AttachmentFile.read({ _id: attachmentFile._id });
  };

  /**
   * List files in storage
   */
  lib.listFiles = async function() {
    const attachmentFiles = await AttachmentFile.find();
    return attachmentFiles.map(({ filename: name, length: size }) => ({
      name, size,
    }));
  };

  return lib;
};
