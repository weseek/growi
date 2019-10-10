const logger = require('@alias/logger')('growi:service:fileUploaderLocal');

const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp');
const streamToPromise = require('stream-to-promise');

module.exports = function(crowi) {
  const Uploader = require('./uploader');
  const lib = new Uploader(crowi);
  const basePath = path.posix.join(crowi.publicDir, 'uploads');

  function getFilePathOnStorage(attachment) {
    let filePath;
    if (attachment.filePath != null) { // backward compatibility for v3.3.x or below
      filePath = path.posix.join(basePath, attachment.filePath);
    }
    else {
      const dirName = (attachment.page != null)
        ? 'attachment'
        : 'user';
      filePath = path.posix.join(basePath, dirName, attachment.fileName);
    }

    return filePath;
  }

  lib.getIsUploadable = function() {
    return true;
  };

  lib.deleteFile = async function(attachment) {
    const filePath = getFilePathOnStorage(attachment);
    return lib.deleteFileByFilePath(filePath);
  };

  lib.deleteFileByFilePath = async function(filePath) {
    // check file exists
    try {
      fs.statSync(filePath);
    }
    catch (err) {
      logger.warn(`Any AttachmentFile which path is '${filePath}' does not exist in local fs`);
    }

    return fs.unlinkSync(filePath);
  };

  lib.uploadFile = async function(fileStream, attachment) {
    logger.debug(`File uploading: fileName=${attachment.fileName}`);

    const filePath = getFilePathOnStorage(attachment);
    const dirpath = path.posix.dirname(filePath);

    // mkdir -p
    mkdir.sync(dirpath);

    const stream = fileStream.pipe(fs.createWriteStream(filePath));
    return streamToPromise(stream);
  };

  /**
   * Find data substance
   *
   * @param {Attachment} attachment
   * @return {stream.Readable} readable stream
   */
  lib.findDeliveryFile = async function(attachment) {
    const filePath = getFilePathOnStorage(attachment);

    // check file exists
    try {
      fs.statSync(filePath);
    }
    catch (err) {
      throw new Error(`Any AttachmentFile that relate to the Attachment (${attachment._id.toString()}) does not exist in local fs`);
    }

    // return stream.Readable
    return fs.createReadStream(filePath);
  };

  /**
   * check the file size limit
   *
   * In detail, the followings are checked.
   * - per-file size limit (specified by MAX_FILE_SIZE)
   */
  lib.checkLimit = async(uploadFileSize) => {
    const maxFileSize = crowi.configManager.getConfig('crowi', 'app:maxFileSize');
    return { isUploadable: uploadFileSize <= maxFileSize, errorMessage: 'File size exceeds the size limit per file' };
  };

  return lib;
};
