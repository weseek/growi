import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:fileUploaderAws');

const urljoin = require('url-join');
const { Storage } = require('@google-cloud/storage');

let _instance;


module.exports = function(crowi) {
  const Uploader = require('./uploader');
  const { configManager } = crowi;
  const lib = new Uploader(crowi);

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

  /**
   * check file existence
   * @param {File} file https://googleapis.dev/nodejs/storage/latest/File.html
   */
  async function isFileExists(file) {
    // check file exists
    const res = await file.exists();
    return res[0];
  }

  lib.isValidUploadSettings = function() {
    return this.configManager.getConfig('crowi', 'gcs:apiKeyJsonPath') != null
      && this.configManager.getConfig('crowi', 'gcs:bucket') != null;
  };

  lib.deleteFile = async function(attachment) {
    const filePath = getFilePathOnStorage(attachment);
    return lib.deleteFileByFilePath(filePath);
  };

  lib.deleteFileByFilePath = async function(filePath) {
    const gcs = getGcsInstance(this.getIsUploadable());
    const myBucket = gcs.bucket(getGcsBucket());
    const file = myBucket.file(filePath);

    // check file exists
    const isExists = await isFileExists(file);
    if (!isExists) {
      logger.warn(`Any object that relate to the Attachment (${filePath}) does not exist in GCS`);
      return;
    }

    return file.delete();
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
    const file = myBucket.file(filePath);

    // check file exists
    const isExists = await isFileExists(file);
    if (!isExists) {
      throw new Error(`Any object that relate to the Attachment (${filePath}) does not exist in GCS`);
    }

    let stream;
    try {
      stream = file.createReadStream();
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
    const gcsTotalLimit = crowi.configManager.getConfig('crowi', 'app:fileUploadTotalLimit');
    return lib.doCheckLimit(uploadFileSize, maxFileSize, gcsTotalLimit);
  };

  return lib;
};
