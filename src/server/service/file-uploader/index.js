const logger = require('@alias/logger')('growi:service:FileUploaderServise');
const S2sMessagingServiceDelegator = require('../s2s-messaging/base');

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

class FileUploadServiceFactory extends S2sMessagingServiceDelegator {

  constructor(uri, publishPath, subscribePath, channelId) {
    super(uri);

    this.publishPath = publishPath;
    this.subscribePath = subscribePath;

    this.channelId = channelId;

    /**
     * A list of S2sMessageHandlable instance
     */
    this.handlableToEventListenerMap = {};

    this.socket = null;

    this.uploader = null;
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
  const { configManager } = crowi;

  const uri = configManager.getConfig('crowi', 'app:nchanUri');

  // when nachan server URI is not set
  if (uri == null) {
    logger.warn('NCHAN_URI is not specified.');
    return;
  }

  const publishPath = configManager.getConfig('crowi', 's2sMessagingPubsub:nchan:publishPath');
  const subscribePath = configManager.getConfig('crowi', 's2sMessagingPubsub:nchan:subscribePath');
  const channelId = configManager.getConfig('crowi', 's2sMessagingPubsub:nchan:channelId');

  const factory = new FileUploadServiceFactory(uri, publishPath, subscribePath, channelId);
  return factory.getUploader(crowi);
};
