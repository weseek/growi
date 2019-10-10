// file uploader virtual class
// 各アップローダーで共通のメソッドはここで定義する

class Uploader {

  constructor(configManager) {
    this.configManager = configManager;
  }

  getIsUploadable() {
    throw new Error('Implement this');
  }

  getFileUploadEnabled() {
    if (!this.getIsUploadable()) {
      return false;
    }

    return !!this.configManager.getConfig('crowi', 'app:fileUpload');
  }

}

module.exports = Uploader;
