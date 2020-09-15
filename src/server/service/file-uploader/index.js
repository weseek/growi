const logger = require('@alias/logger')('growi:service:FileUploaderServise');
const Gridfs = require('./gridfs');
const S2sMessagingServiceDelegator = require('./base');

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

  async initialize() {
    this.isFileUploaderSetup = false;

    const method = envToModuleMappings[process.env.FILE_UPLOAD] || 'aws';

    switch (method) {
      case 'gridfs':
        this.fileUploader = new Gridfs(this.crowi);
        break;
      // TODO others
      default:
        this.fileUploader = null;
        break;
    }

    if (this.fileUploader != null) {
      this.isFileUploaderSetup = true;
    }

    logger.debug('fileUploader initialized');
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
      this.initializeDelegator(crowi);
    }
    return this.uploader;
  }

}

const factory = new FileUploadServiceFactory();

module.exports = (crowi) => {
  return factory.getUploader(crowi);
};
