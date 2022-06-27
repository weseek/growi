import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:fileUploaderAws');

const { Storage } = require('@google-cloud/storage');
const urljoin = require('url-join');

let _instance;


module.exports = function(crowi) {
  const Uploader = require('./uploader');
  const { configManager } = crowi;
  const lib = new Uploader(crowi);

  function getGcsBucket() {
    return configManager.getConfig('crowi', 'gcs:bucket');
  }

  function getGcsInstance() {
    if (_instance == null) {
      const keyFilename = configManager.getConfig('crowi', 'gcs:apiKeyJsonPath');
      // see https://googleapis.dev/nodejs/storage/latest/Storage.html
      _instance = keyFilename != null
        ? new Storage({ keyFilename }) // Create a client with explicit credentials
        : new Storage(); // Create a client that uses Application Default Credentials
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

  lib.canRespond = function() {
    return !this.configManager.getConfig('crowi', 'gcs:referenceFileWithRelayMode');
  };

  lib.respond = async function(res, attachment) {
    if (!this.getIsUploadable()) {
      throw new Error('GCS is not configured.');
    }
    const temporaryUrl = attachment.getValidTemporaryUrl();
    if (temporaryUrl != null) {
      return res.redirect(temporaryUrl);
    }

    const gcs = getGcsInstance();
    const myBucket = gcs.bucket(getGcsBucket());
    const filePath = getFilePathOnStorage(attachment);
    const file = myBucket.file(filePath);
    const lifetimeSecForTemporaryUrl = this.configManager.getConfig('crowi', 'gcs:lifetimeSecForTemporaryUrl');

    // issue signed url (default: expires 120 seconds)
    // https://cloud.google.com/storage/docs/access-control/signed-urls
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + lifetimeSecForTemporaryUrl * 1000,
    });

    res.redirect(signedUrl);

    try {
      return attachment.cashTemporaryUrlByProvideSec(signedUrl, lifetimeSecForTemporaryUrl);
    }
    catch (err) {
      logger.error(err);
    }

  };

  lib.deleteFile = function(attachment) {
    const filePath = getFilePathOnStorage(attachment);
    return lib.deleteFilesByFilePaths([filePath]);
  };

  lib.deleteFiles = function(attachments) {
    const filePaths = attachments.map((attachment) => {
      return getFilePathOnStorage(attachment);
    });
    return lib.deleteFilesByFilePaths(filePaths);
  };

  lib.deleteFilesByFilePaths = function(filePaths) {
    if (!this.getIsUploadable()) {
      throw new Error('GCS is not configured.');
    }

    const gcs = getGcsInstance();
    const myBucket = gcs.bucket(getGcsBucket());

    const files = filePaths.map((filePath) => {
      return myBucket.file(filePath);
    });

    files.forEach((file) => {
      file.delete({ ignoreNotFound: true });
    });
  };

  lib.uploadFile = function(fileStream, attachment) {
    if (!this.getIsUploadable()) {
      throw new Error('GCS is not configured.');
    }

    logger.debug(`File uploading: fileName=${attachment.fileName}`);

    const gcs = getGcsInstance();
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
    if (!this.getIsReadable()) {
      throw new Error('GCS is not configured.');
    }

    const gcs = getGcsInstance();
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
