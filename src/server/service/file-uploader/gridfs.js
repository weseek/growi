const logger = require('@alias/logger')('growi:service:fileUploaderGridfs');
const mongoose = require('mongoose');
const util = require('util');

module.exports = function(crowi) {
  const Uploader = require('./uploader');
  const lib = new Uploader(crowi);
  const COLLECTION_NAME = 'attachmentFiles';
  const CHUNK_COLLECTION_NAME = `${COLLECTION_NAME}.chunks`;

  // instantiate mongoose-gridfs
  const { createModel } = require('mongoose-gridfs');
  const AttachmentFile = createModel({
    modelName: COLLECTION_NAME,
    bucketName: COLLECTION_NAME,
    connection: mongoose.connection,
  });
  // get Collection instance of chunk
  const chunkCollection = mongoose.connection.collection(CHUNK_COLLECTION_NAME);

  // create promisified method
  AttachmentFile.promisifiedWrite = util.promisify(AttachmentFile.write).bind(AttachmentFile);
  AttachmentFile.promisifiedUnlink = util.promisify(AttachmentFile.unlink).bind(AttachmentFile);

  lib.getIsUploadable = function() {
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

  /**
   * get size of data uploaded files using (Promise wrapper)
   */
  const getCollectionSize = () => {
    return new Promise((resolve, reject) => {
      chunkCollection.stats((err, data) => {
        if (err) {
          // return 0 if not exist
          if (err.errmsg.includes('not found')) {
            return resolve(0);
          }
          return reject(err);
        }
        return resolve(data.size);
      });
    });
  };

  /**
   * check the file size limit
   *
   * In detail, the followings are checked.
   * - per-file size limit (specified by MAX_FILE_SIZE)
   * - mongodb(gridfs) size limit (specified by MONGO_GRIDFS_TOTAL_LIMIT)
   */
  lib.checkLimit = async(uploadFileSize) => {
    const maxFileSize = crowi.configManager.getConfig('crowi', 'app:maxFileSize');
    if (uploadFileSize > maxFileSize) {
      return { isUploadable: false, errorMessage: 'File size exceeds the size limit per file' };
    }

    let usingFilesSize;
    try {
      usingFilesSize = await getCollectionSize();
    }
    catch (err) {
      logger.error(err);
      return { isUploadable: false, errorMessage: err.errmsg };
    }

    // Use app:fileUploadTotalLimit if gridfs:totalLimit is null (default for gridfs:totalLimitd is null)
    const gridfsTotalLimit = crowi.configManager.getConfig('crowi', 'gridfs:totalLimit')
      || crowi.configManager.getConfig('crowi', 'app:fileUploadTotalLimit');
    if (usingFilesSize + uploadFileSize > gridfsTotalLimit) {
      return { isUploadable: false, errorMessage: 'MongoDB for uploading files reaches limit' };
    }

    return { isUploadable: true };
  };

  lib.uploadFile = async function(fileStream, attachment) {
    logger.debug(`File uploading: fileName=${attachment.fileName}`);

    return AttachmentFile.promisifiedWrite(
      {
        filename: attachment.fileName,
        contentType: attachment.fileFormat,
      },
      fileStream,
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

  return lib;
};
