import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:fileUploaderLocal');

const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp');
const streamToPromise = require('stream-to-promise');
const urljoin = require('url-join');

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

  lib.isValidUploadSettings = function() {
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
      return;
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
    const totalLimit = crowi.configManager.getConfig('crowi', 'app:fileUploadTotalLimit');
    return lib.doCheckLimit(uploadFileSize, maxFileSize, totalLimit);
  };

  /**
   * Checks if Uploader can respond to the HTTP request.
   */
  lib.canRespond = () => {
    // Check whether to use internal redirect of nginx or Apache.
    return process.env.FILE_UPLOAD === 'local' && lib.configManager.getConfig('crowi', 'fileUpload:local:useInternalRedirect');
  };

  /**
   * Respond to the HTTP request.
   * @param {Response} res
   * @param {Response} attachment
   */
  lib.respond = (res, attachment) => {
    // Responce using internal redirect of nginx or Apache.
    const storagePath = getFilePathOnStorage(attachment);
    const relativePath = path.relative(crowi.publicDir, storagePath);
    const internalPathRoot = lib.configManager.getConfig('crowi', 'fileUpload:local:internalRedirectPath');
    const internalPath = urljoin(internalPathRoot, relativePath);
    res.set('X-Accel-Redirect', internalPath);
    res.set('X-Sendfile', storagePath);
    return res.end();
  };

  return lib;
};
