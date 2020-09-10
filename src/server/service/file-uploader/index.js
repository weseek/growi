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

    this.appService = crowi.appService;
    this.configManager = crowi.configManager;

    this.fileUploader = {};

    /**
     * the flag whether fileUploader is set up successfully
     */
    this.isFileUploaderSetup = false;

    this.initialize();
  }

  initialize() {
    console.log('setUP!');
  }

  getUploader(crowi) {
    if (this.uploader == null) {
      const method = envToModuleMappings[process.env.FILE_UPLOAD] || 'aws';
      const modulePath = `./${method}`;
      this.uploader = require(modulePath)(crowi);
    }

    return this.uploader;
  }

}

module.exports = FileUploaderServise;
