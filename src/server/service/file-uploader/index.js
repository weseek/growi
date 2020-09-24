const logger = require('@alias/logger')('growi:service:FileUploaderServise');
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
  const factory = new FileUploadServiceFactory(crowi);
  return factory.getUploader(crowi);
};
