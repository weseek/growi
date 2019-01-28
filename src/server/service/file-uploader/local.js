const logger = require('@alias/logger')('growi:service:fileUploaderLocal');

const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp');
const streamToPromise = require('stream-to-promise');

module.exports = function(crowi) {
  'use strict';

  const lib = {};
  const basePath = path.posix.join(crowi.publicDir, 'uploads');

  function getFilePathOnStorage(attachment) {
    let filePath;
    if (attachment.filePath != null) {  // backward compatibility for v3.3.5 or below
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

  lib.deleteFile = function(fileId, filePath) {
    logger.debug('File deletion: ' + filePath);
    return new Promise(function(resolve, reject) {
      fs.unlink(path.posix.join(basePath, filePath), function(err) {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
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
   * chech storage for fileUpload reaches MONGO_GRIDFS_TOTAL_LIMIT (for gridfs)
   */
  lib.checkCapacity = async(uploadFileSize) => {
    return true;
  };

  return lib;
};


