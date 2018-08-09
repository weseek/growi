class FileUploaderFactory {

  getUploader(crowi) {
    if (this.uploader == null) {
      const method = process.env.FILE_UPLOAD || 'aws';
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
