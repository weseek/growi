const logger = require('@alias/logger')('growi:service:FileUploader');

const S2sMessage = require('../models/vo/s2s-message');
const S2sMessageHandlable = require('./s2s-messaging/handlable');

class fileUploaderSwitch extends S2sMessageHandlable {

  constructor(crowi) {
    super();

    this.crowi = crowi;
    this.configManager = crowi.configManager;
    this.s2sMessagingService = crowi.s2sMessagingService;
    this.appService = crowi.appService;
    this.xssService = crowi.xssService;

    this.lastLoadedAt = null;
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
    await this.crowi.setUpFileUpload(true);
  }

  async publishUpdatedMessage() {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('fileUploadServiceUpdated', { updatedAt: new Date() });

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
      }
    }
  }

}

module.exports = fileUploaderSwitch;
