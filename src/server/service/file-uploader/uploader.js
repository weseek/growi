// file uploader virtual class
// 各アップローダーで共通のメソッドはここで定義する

class Uploader {

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;
  }

  getIsUploadable() {
    throw new Error('Implement this');
  }

  getFileUploadEnabled() {
    if (!this.getIsUploadable()) {
      return false;
    }

    return !!this.configManager.getConfig('crowi', 'app:fileUpload');
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
    const Attachment = this.crowi.model('Attachment');
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

}

module.exports = Uploader;
