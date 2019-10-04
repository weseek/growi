const logger = require('@alias/logger')('growi:service:fileUploaderAws');

const urljoin = require('url-join');
const { Storage } = require('@google-cloud/storage');

let _instance;


module.exports = function(crowi) {
  const Uploader = require('./uploader');
  const { configManager } = crowi;
  const lib = new Uploader(configManager);

  function getGcsBucket() {
    return configManager.getConfig('crowi', 'gcs:bucket');
  }

  function getGcsInstance(isUploadable) {
    if (!isUploadable) {
      throw new Error('GCS is not configured.');
    }
    if (_instance == null) {
      const keyFilename = configManager.getConfig('crowi', 'gcs:apiKeyJsonPath');
      // see https://googleapis.dev/nodejs/storage/latest/Storage.html
      _instance = new Storage({ keyFilename });
    }
    return _instance;
  }

  function getFilePathOnStorage(attachment) {
    const namespace = configManager.getConfig('crowi', 'gcs:uploadNamespace');
    // const namespace = null;
    const dirName = (attachment.page != null)
      ? 'attachment'
      : 'user';
    const filePath = urljoin(namespace || '', dirName, attachment.fileName);

    return filePath;
  }

  lib.getIsUploadable = function() {
    return this.configManager.getConfig('crowi', 'gcs:apiKeyJsonPath') != null && this.configManager.getConfig('crowi', 'gcs:bucket') != null;
  };

  lib.deleteFile = async function(attachment) {
    const filePath = getFilePathOnStorage(attachment);
    return lib.deleteFileByFilePath(filePath);
  };

  lib.deleteFileByFilePath = async function(filePath) {
    const gcs = getGcsInstance(this.getIsUploadable());
    const myBucket = gcs.bucket(getGcsBucket());

    // TODO: ensure not to throw error even when the file does not exist

    return myBucket.file(filePath).delete();
  };

  lib.uploadFile = function(fileStream, attachment) {
    logger.debug(`File uploading: fileName=${attachment.fileName}`);

    const gcs = getGcsInstance(this.getIsUploadable());
    const myBucket = gcs.bucket(getGcsBucket());
    const filePath = getFilePathOnStorage(attachment);
    const options = {
      destination: filePath,
    };

    return myBucket.upload(fileStream.path, options);
  };

  /**
   * Find data substance
   *
   * @param {Attachment} attachment
   * @return {stream.Readable} readable stream
   */
  lib.findDeliveryFile = async function(attachment) {
    const gcs = getGcsInstance(this.getIsUploadable());
    const myBucket = gcs.bucket(getGcsBucket());
    const filePath = getFilePathOnStorage(attachment);

    let stream;
    try {
      stream = myBucket.file(filePath).createReadStream();
    }
    catch (err) {
      logger.error(err);
      throw new Error(`Coudn't get file from AWS for the Attachment (${attachment._id.toString()})`);
    }

    // return stream.Readable
    return stream;
  };

  /**
   * check the file size limit
   *
   * In detail, the followings are checked.
   * - per-file size limit (specified by MAX_FILE_SIZE)
   */
  lib.checkLimit = async(uploadFileSize) => {
    const maxFileSize = crowi.configManager.getConfig('crowi', 'app:maxFileSize');
    if (uploadFileSize > maxFileSize) {
      return { isUploadable: false, errorMessage: 'File size exceeds the size limit per file' };
    }

    const gcs = getGcsInstance(lib.getIsUploadable());
    const myBucket = gcs.bucket(getGcsBucket());

    const files = await myBucket.getFiles();
    const usingFilesSize = files[0].map(f => Number(f.metadata.size)).reduce((prev, current) => prev + current);

    // TODO gridfs:totalLimit を共通化するか GCS 用にする
    const gcsTotalLimit = crowi.configManager.getConfig('crowi', 'gridfs:totalLimit');
    if (usingFilesSize + uploadFileSize > gcsTotalLimit) {
      return { isUploadable: false, errorMessage: 'GCS for uploading files reaches limit' };
    }

    return { isUploadable: true };
  };

  return lib;
};
