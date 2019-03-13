const logger = require('@alias/logger')('growi:service:fileUploaderGridfs');
const mongoose = require('mongoose');
const util = require('util');

module.exports = function(crowi) {
  const lib = {};

  // instantiate mongoose-gridfs
  const gridfs = require('mongoose-gridfs')({
    collection: 'attachmentFiles',
    model: 'AttachmentFile',
    mongooseConnection: mongoose.connection,
  });

  // obtain a model
  const AttachmentFile = gridfs.model;
  const Chunks = mongoose.model('Chunks', gridfs.schema, 'attachmentFiles.chunks');

  // create promisified method
  AttachmentFile.promisifiedWrite = util.promisify(AttachmentFile.write).bind(AttachmentFile);

  lib.deleteFile = async function(attachment) {
    let filenameValue = attachment.fileName;

    if (attachment.filePath != null) { // backward compatibility for v3.3.x or below
      filenameValue = attachment.filePath;
    }

    const attachmentFile = await AttachmentFile.findOne({ filename: filenameValue });

    AttachmentFile.unlinkById(attachmentFile._id, (error, unlinkedFile) => {
      if (error) {
        throw new Error(error);
      }
    });
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

    const usingFilesSize = await getCollectionSize();
    const gridfsTotalLimit = crowi.configManager.getConfig('crowi', 'gridfs:totalLimit');
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
    return AttachmentFile.readById(attachmentFile._id);
  };

  return lib;
};
