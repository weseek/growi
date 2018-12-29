const debug = require('debug')('growi:service:fileUploaderLocal');

const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp');

module.exports = function(crowi) {
  'use strict';

  const lib = {};
  const basePath = path.posix.join(crowi.publicDir, 'uploads'); // TODO: to configurable

  lib.deleteFile = function(fileId, filePath) {
    debug('File deletion: ' + filePath);
    return new Promise(function(resolve, reject) {
      fs.unlink(path.posix.join(basePath, filePath), function(err) {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  };

  lib.uploadFile = function(filePath, contentType, fileStream, options) {
    debug('File uploading: ' + filePath);
    return new Promise(function(resolve, reject) {
      var localFilePath = path.posix.join(basePath, filePath)
        , dirpath = path.posix.dirname(localFilePath);

      mkdir(dirpath, function(err) {
        if (err) {
          return reject(err);
        }

        var writer = fs.createWriteStream(localFilePath);

        writer.on('error', function(err) {
          reject(err);
        }).on('finish', function() {
          resolve();
        });

        fileStream.pipe(writer);
      });
    });
  };

  /**
   * Find data substance
   *
   * @param {Attachment} attachment
   * @return {stream.Readable} readable stream
   */
  lib.findDeliveryFile = async function(attachment) {
    const uploadDir = path.posix.join(crowi.publicDir, 'uploads');
    const filePath = path.posix.join(uploadDir, attachment.getFilePathOnStorage());

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


