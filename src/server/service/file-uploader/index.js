const logger = require('@alias/logger')('growi:service:FileUploaderServise');
const Gridfs = require('./gridfs');

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

class FileUploaderServise {

  constructor(crowi) {

    this.crowi = crowi;
    this.appService = crowi.appService;
    this.configManager = crowi.configManager;

    this.fileUploader = null;

    /**
     * the flag whether fileUploader is set up successfully
     */
    this.isFileUploaderSetup = false;

    this.initialize();
  }

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

}

module.exports = FileUploaderServise;
