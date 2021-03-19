
import Attachment from '~/server/models/attachment';

// file uploader virtual class
class Uploader {

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;
  }

  getIsUploadable() {
    return !this.configManager.getConfig('crowi', 'app:fileUploadDisabled') && this.isValidUploadSettings();
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
    // Get attachment total file size
    const res = await Attachment.aggregate().group({
      _id: null,
      total: { $sum: '$fileSize' },
    });
    // Return res is [] if not using
    const usingFilesSize = res.length === 0 ? 0 : res[0].total;

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
