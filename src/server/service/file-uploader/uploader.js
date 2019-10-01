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
        || (
          !this.configManager.getConfig('crowi', 'aws:region')
            && !this.configManager.getConfig('crowi', 'aws:customEndpoint'))
        || !this.configManager.getConfig('crowi', 'aws:bucket'))) {
      return false;
    }
    // method が gcp かつ、
    // TODO 環境変数の取得方法をもう一度確認して gcp: ってところ修正する
    if (method === 'gcp' && (
      !this.configManager.getConfig('crowi', 'gcp:bucket')
        || !this.configManager.getConfig('crowi', 'gcp:bucket'))
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
