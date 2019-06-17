// file uploader virtual class
// 各アップローダーで共通のメソッドはここで定義する

class Uploader {

  constructor(configManager) {
    this.configManager = configManager;
  }

  getIsUploadable() {
    const method = process.env.FILE_UPLOAD || 'aws';

    if (method === 'aws' && (
      !this.configManager.getConfig('crowi', 'aws:accessKeyId')
        || !this.configManager.getConfig('crowi', 'aws:secretAccessKey')
        || !this.configManager.getConfig('crowi', 'aws:region')
        || !this.configManager.getConfig('crowi', 'aws:bucket'))) {
      return false;
    }

    return method !== 'none';
  }

}

module.exports = Uploader;
