const envToModuleMappings = {
  aws:     'aws',
  local:   'local',
  none:    'none',
  mongodb: 'gridfs',
};

class FileUploaderFactory {

  getUploader(crowi) {
    if (this.uploader == null) {
      const method = envToModuleMappings[process.env.FILE_UPLOAD] || 'aws';
      const modulePath = `./${method}`;
      this.uploader = require(modulePath)(crowi);
    }

    return this.uploader;
  }

}

const factory = new FileUploaderFactory();
module.exports = (crowi) => {
  return factory.getUploader(crowi);
};
