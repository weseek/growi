import { randomUUID } from 'crypto';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:fileUploader');

// file uploader virtual class
// 各アップローダーで共通のメソッドはここで定義する

class Uploader {

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;
  }

  getIsUploadable() {
    return !this.configManager.getConfig('crowi', 'app:fileUploadDisabled') && this.isValidUploadSettings();
  }

  /**
   * Returns whether write opration to the storage is permitted
   * @returns Whether write opration to the storage is permitted
   */
  async isWritable() {
    const filePath = `${randomUUID()}.growi`;
    const data = 'This file was created during g2g transfer to check write permission. You can safely remove this file.';

    try {
      await this.saveFile({
        filePath,
        contentType: 'text/plain',
        data,
      });
      // TODO: delete tmp file in background

      return true;
    }
    catch (err) {
      logger.error(err);
      return false;
    }
  }

  // File reading is possible even if uploading is disabled
  getIsReadable() {
    return this.isValidUploadSettings();
  }

  isValidUploadSettings() {
    throw new Error('Implement this');
  }

  getFileUploadEnabled() {
    if (!this.getIsUploadable()) {
      return false;
    }

    return !!this.configManager.getConfig('crowi', 'app:fileUpload');
  }

  deleteFiles() {
    throw new Error('Implemnt this');
  }

  /**
   * Returns file upload total limit in bytes.
   * Reference to previous implementation is
   * {@link https://github.com/weseek/growi/blob/798e44f14ad01544c1d75ba83d4dfb321a94aa0b/src/server/service/file-uploader/gridfs.js#L86-L88}
   * @returns file upload total limit in bytes
   */
  getFileUploadTotalLimit() {
    const { getConfig } = this.configManager;

    const fileUploadTotalLimit = getConfig('crowi', 'app:fileUploadType') === 'mongodb'
      // Use app:fileUploadTotalLimit if gridfs:totalLimit is null (default for gridfs:totalLimit is null)
      ? getConfig('crowi', 'gridfs:totalLimit') ?? getConfig('crowi', 'app:fileUploadTotalLimit')
      : getConfig('crowi', 'app:fileUploadTotalLimit');
    return fileUploadTotalLimit;
  }

  /**
   * Get total file size
   * @returns Total file size
   */
  async getTotalFileSize() {
    const Attachment = this.crowi.model('Attachment');

    // Get attachment total file size
    const res = await Attachment.aggregate().group({
      _id: null,
      total: { $sum: '$fileSize' },
    });

    // res is [] if not using
    return res.length === 0 ? 0 : res[0].total;
  }

  /**
   * Check files size limits for all uploaders
   *
   * @param {*} uploadFileSize
   * @param {*} maxFileSize
   * @param {*} totalLimit
   * @returns
   * @memberof Uploader
   */
  async doCheckLimit(uploadFileSize, maxFileSize, totalLimit) {
    if (uploadFileSize > maxFileSize) {
      return { isUploadable: false, errorMessage: 'File size exceeds the size limit per file' };
    }

    const usingFilesSize = await this.getTotalFileSize();
    if (usingFilesSize + uploadFileSize > totalLimit) {
      return { isUploadable: false, errorMessage: 'Uploading files reaches limit' };
    }

    return { isUploadable: true };
  }

  /**
   * Checks if Uploader can respond to the HTTP request.
   */
  canRespond() {
    return false;
  }

  /**
   * Respond to the HTTP request.
   * @param {Response} res
   * @param {Response} attachment
   */
  respond(res, attachment) {
    throw new Error('Implement this');
  }

}

module.exports = Uploader;
