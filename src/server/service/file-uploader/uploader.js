const logger = require('@alias/logger')('growi:service:FileUploader');

// file uploader virtual class
// 各アップローダーで共通のメソッドはここで定義する
const S2sMessage = require('../../models/vo/s2s-message');
const S2sMessageHandlable = require('../s2s-messaging/handlable');

class Uploader extends S2sMessageHandlable {

  constructor(crowi) {
    super();

    this.crowi = crowi;
    this.configManager = crowi.configManager;
    this.s2sMessagingService = crowi.s2sMessagingService;
    this.appService = crowi.appService;
    this.xssService = crowi.xssService;

    this.lastLoadedAt = null;
  }

  getIsUploadable() {
    return !this.configManager.getConfig('crowi', 'app:fileUploadDisabled') && this.isValidUploadSettings();
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

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage) {
    const { eventName, updatedAt } = s2sMessage;
    if (eventName !== 'fileUploadServiceUpdated' || updatedAt == null) {
      return false;
    }

    return this.lastLoadedAt == null || this.lastLoadedAt < new Date(s2sMessage.updatedAt);
  }

  /**
   * @inheritdoc
   */
  async handleS2sMessage(s2sMessage) {
    const { configManager } = this;

    logger.info('Reset fileupload service by pubsub notification');
    await configManager.loadConfigs();
    this.initCustomCss();
    this.initCustomTitle();
  }


  async publishUpdatedMessage() {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('customizeServiceUpdated', { updatedAt: new Date() });

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
      }
    }
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
