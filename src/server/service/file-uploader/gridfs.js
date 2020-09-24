const logger = require('@alias/logger')('growi:service:fileUploaderGridfs');
const mongoose = require('mongoose');
const { createModel } = require('mongoose-gridfs');
const util = require('util');
const Uploader = require('./uploader');

const COLLECTION_NAME = 'attachmentFiles';

class Gridfs extends Uploader {

  constructor(crowi) {
    super(crowi);

    this.initialize();
  }

  initialize() {
    this.AttachmentFile = createModel({
      modelName: COLLECTION_NAME,
      bucketName: COLLECTION_NAME,
      connection: mongoose.connection,
    });
    // get Collection instance of chunk
    // const chunkCollection = mongoose.connection.collection(CHUNK_COLLECTION_NAME);

    // create promisified method
    this.AttachmentFile.promisifiedWrite = util.promisify(this.AttachmentFile.write).bind(this.AttachmentFile);
    this.AttachmentFile.promisifiedUnlink = util.promisify(this.AttachmentFile.unlink).bind(this.AttachmentFile);
  }

  getisValidUploadSettings() {
    return true;
  }

  async deleteFile(attachment) {
    let filenameValue = attachment.fileName;

    if (attachment.filePath != null) { // backward compatibility for v3.3.x or below
      filenameValue = attachment.filePath;
    }

    const attachmentFile = await this.AttachmentFile.findOne({ filename: filenameValue });

    if (attachmentFile == null) {
      logger.warn(`Any AttachmentFile that relate to the Attachment (${attachment._id.toString()}) does not exist in GridFS`);
      return;
    }

    return this.AttachmentFile.promisifiedUnlink({ _id: attachmentFile._id });
  }

  /**
   * get size of data uploaded files using (Promise wrapper)
   */
  // const getCollectionSize = () => {
  //   return new Promise((resolve, reject) => {
  //     chunkCollection.stats((err, data) => {
  //       if (err) {
  //         // return 0 if not exist
  //         if (err.errmsg.includes('not found')) {
  //           return resolve(0);
  //         }
  //         return reject(err);
  //       }
  //       return resolve(data.size);
  //     });
  //   });
  // };

  /**
   * check the file size limit
   *
   * In detail, the followings are checked.
   * - per-file size limit (specified by MAX_FILE_SIZE)
   * - mongodb(gridfs) size limit (specified by MONGO_GRIDFS_TOTAL_LIMIT)
   */
  async checkLimit(uploadFileSize) {
    const maxFileSize = this.crowi.configManager.getConfig('crowi', 'app:maxFileSize');

    // Use app:fileUploadTotalLimit if gridfs:totalLimit is null (default for gridfs:totalLimitd is null)
    const gridfsTotalLimit = this.crowi.configManager.getConfig('crowi', 'gridfs:totalLimit')
      || this.crowi.configManager.getConfig('crowi', 'app:fileUploadTotalLimit');
    return this.doCheckLimit(uploadFileSize, maxFileSize, gridfsTotalLimit);
  }

  async uploadFile(fileStream, attachment) {
    logger.debug(`File uploading: fileName=${attachment.fileName}`);

    return this.AttachmentFile.promisifiedWrite(
      {
        filename: attachment.fileName,
        contentType: attachment.fileFormat,
      },
      fileStream,
    );
  }


  /**
   * Find data substance
   *
   * @param {Attachment} attachment
   * @return {stream.Readable} readable stream
   */
  async findDeliveryFile(attachment) {
    let filenameValue = attachment.fileName;

    if (attachment.filePath != null) { // backward compatibility for v3.3.x or below
      filenameValue = attachment.filePath;
    }

    const attachmentFile = await this.AttachmentFile.findOne({ filename: filenameValue });

    if (attachmentFile == null) {
      throw new Error(`Any AttachmentFile that relate to the Attachment (${attachment._id.toString()}) does not exist in GridFS`);
    }

    // return stream.Readable
    return this.AttachmentFile.read({ _id: attachmentFile._id });
  }

}

module.exports = Gridfs;
