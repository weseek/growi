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

  const factory = new FileUploadServiceFactory(uri);
  return factory.getUploader(crowi);
};
