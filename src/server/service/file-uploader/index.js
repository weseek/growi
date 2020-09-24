const logger = require('@alias/logger')('growi:service:FileUploaderServise');

const S2sMessage = require('../../models/vo/s2s-message');
const S2sMessageHandlable = require('../s2s-messaging/handlable');

const envToModuleMappings = {
  aws:     'aws',
  local:   'local',
  none:    'none',
  mongo:   'gridfs',
  mongodb: 'gridfs',
  gridfs:  'gridfs',
  gcp:     'gcs',
  gcs:     'gcs',
};

class FileUploadServiceFactory extends S2sMessageHandlable {

  constructor(crowi) {
    super();

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

  initializeUploader(crowi) {
    const method = envToModuleMappings[process.env.FILE_UPLOAD] || 'aws';

    const modulePath = `./${method}`;
    this.uploader = require(modulePath)(crowi);

    if (this.uploader == null) {
      logger.warn('Failed to initialize uploader.');
    }
  }

  getUploader(crowi) {
    if (this.uploader == null) {
      this.initializeUploader(crowi);
    }
    return this.uploader;
  }

}


module.exports = (crowi) => {
  return new FileUploadServiceFactory(crowi);
};
