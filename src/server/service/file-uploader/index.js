const logger = require('@alias/logger')('growi:service:FileUploaderServise');

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

class FileUploadServiceFactory {

  initializeUploader(crowi) {
    const method = envToModuleMappings[crowi.configManager.getConfig('crowi', 'app:fileUploadType')];
    const modulePath = `./${method}`;
    this.uploader = require(modulePath)(crowi);

    if (this.uploader == null) {
      logger.warn('Failed to initialize uploader.');
    }
  }

  getUploader(crowi) {
    this.initializeUploader(crowi);
    return this.uploader;
  }

}

module.exports = (crowi) => {
  const factory = new FileUploadServiceFactory(crowi);
  return factory.getUploader(crowi);
};
