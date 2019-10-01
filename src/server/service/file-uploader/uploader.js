// file uploader virtual class
// 各アップローダーで共通のメソッドはここで定義する

class Uploader {

  constructor(configManager) {
    this.configManager = configManager;
  }

  getIsUploadable() {
    // TODO Add alias support
    const method = process.env.FILE_UPLOAD || 'aws';

    if (method === 'aws' && (
      !this.configManager.getConfig('crowi', 'aws:accessKeyId')
        || !this.configManager.getConfig('crowi', 'aws:secretAccessKey')
        || (
          !this.configManager.getConfig('crowi', 'aws:region')
            && !this.configManager.getConfig('crowi', 'aws:customEndpoint'))
        || !this.configManager.getConfig('crowi', 'aws:bucket'))) {
      return false;
    }
    // When method is gcs and gcs:api Key JsonPath or gcs:bucket is set is false
    if (method === 'gsc' && (
      !this.configManager.getConfig('crowi', 'gcs:apiKeyJsonPath')
        || !this.configManager.getConfig('crowi', 'gcs:bucket'))
    ) {
      return false;
    }

    return method !== 'none';
  }

  getFileUploadEnabled() {
    if (!this.getIsUploadable()) {
      return false;
    }

    return !!this.configManager.getConfig('crowi', 'app:fileUpload');
  }

}

module.exports = Uploader;
