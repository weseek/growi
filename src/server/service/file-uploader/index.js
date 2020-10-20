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
    // temporarily use envToModuleMappings [remove this in GW-4136]
    const fileUplodeTypeInConfig = envToModuleMappings[crowi.configManager.getConfig('crowi', 'app:fileUploadType')];

    const method = envToModuleMappings[process.env.FILE_UPLOAD] || fileUplodeTypeInConfig || 'aws';
    const modulePath = `./${method}`;
    this.uploader = require(modulePath)(crowi);

    if (this.uploader == null) {
      logger.warn('Failed to initialize uploader.');
    }
  }

  getUploader(crowi, isForceUpdate) {
    if (this.uploader == null || isForceUpdate) {
      this.initializeUploader(crowi);
    }
    return this.uploader;
  }

}

module.exports = (crowi, isForceUpdate) => {
  const factory = new FileUploadServiceFactory(crowi);
  return factory.getUploader(crowi, isForceUpdate);
};
