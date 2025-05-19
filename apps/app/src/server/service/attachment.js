import loggerFactory from '~/utils/logger';

import { AttachmentType } from '../interfaces/attachment';
import { Attachment } from '../models/attachment';

const fs = require('fs');

const mongoose = require('mongoose');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:service:AttachmentService');

const createReadStream = (filePath) => {
  return fs.createReadStream(filePath, {
    flags: 'r', encoding: null, fd: null, mode: '0666', autoClose: true,
  });
};

/**
 * the service class for Attachment and file-uploader
 */
class AttachmentService {

  /** @type {Array<(pageId: string, file: Express.Multer.File, readable: Readable) => Promise<void>>} */
  attachHandlers = [];

  /** @type {Array<(attachmentId: string) => Promise<void>>} */
  detachHandlers = [];

  /** @type {import('~/server/crowi').default} Crowi instance */
  crowi;

  /** @param {import('~/server/crowi').default} crowi Crowi instance */
  constructor(crowi) {
    this.crowi = crowi;
  }

  async createAttachment(file, user, pageId = null, attachmentType, disposeTmpFileCallback) {
    const { fileUploadService } = this.crowi;

    // check limit
    const res = await fileUploadService.checkLimit(file.size);
    if (!res.isUploadable) {
      throw new Error(res.errorMessage);
    }

    const readStreamForCreateAttachmentDocument = createReadStream(file.path);

    // create an Attachment document and upload file
    let attachment;
    try {
      attachment = Attachment.createWithoutSave(pageId, user, file.originalname, file.mimetype, file.size, attachmentType);
      await fileUploadService.uploadAttachment(readStreamForCreateAttachmentDocument, attachment);
      await attachment.save();

      //  Creates a new stream for each operation instead of reusing the original stream.
      //  REASON: Node.js Readable streams cannot be reused after consumption.
      //  When a stream is piped or consumed, its internal state changes and the data pointers
      //  are advanced to the end, making it impossible to read the same data again.
      const readStreamForAttachedHandlers = [];
      const attachedHandlerPromises = this.attachHandlers.map((handler) => {
        const readStreamForAttachedHandler = createReadStream(file.path);
        readStreamForAttachedHandlers.push(readStreamForAttachedHandler);
        return handler(pageId, file, readStreamForAttachedHandler);
      });

      // Do not await, run in background
      Promise.all(attachedHandlerPromises)
        .catch((err) => {
          logger.error('Error while executing attach handler', err);
        })
        .finally(() => {
          // readStreamForAttachedHandler?.destroy();
          readStreamForAttachedHandlers.forEach(readStream => readStream.destroy());
          disposeTmpFileCallback?.(file);
        });
    }
    catch (err) {
      logger.error('Error while creating attachment', err);
      disposeTmpFileCallback?.(file);
      throw err;
    }
    finally {
      readStreamForCreateAttachmentDocument.destroy();
    }

    return attachment;
  }

  async removeAllAttachments(attachments) {
    const { fileUploadService } = this.crowi;
    const attachmentsCollection = mongoose.connection.collection('attachments');
    const unorderAttachmentsBulkOp = attachmentsCollection.initializeUnorderedBulkOp();

    if (attachments.length === 0) {
      return;
    }

    attachments.forEach((attachment) => {
      unorderAttachmentsBulkOp.find({ _id: attachment._id }).delete();
    });
    await unorderAttachmentsBulkOp.execute();

    await fileUploadService.deleteFiles(attachments);

    return;
  }

  async removeAttachment(attachmentId) {
    const { fileUploadService } = this.crowi;
    const attachment = await Attachment.findById(attachmentId);

    await fileUploadService.deleteFile(attachment);
    await attachment.remove();

    const detachedHandlerPromises = this.detachHandlers.map((handler) => {
      return handler(attachment._id);
    });

    // Do not await, run in background
    Promise.all(detachedHandlerPromises)
      .catch((err) => {
        logger.error('Error while executing detached handler', err);
      });

    return;
  }

  async isBrandLogoExist() {
    const query = { attachmentType: AttachmentType.BRAND_LOGO };
    const count = await Attachment.countDocuments(query);

    return count >= 1;
  }

  /**
   * Register a handler that will be called after attachment creation
   * @param {(pageId: string, file: Express.Multer.File, readable: Readable) => Promise<void>} handler
   */
  addAttachHandler(handler) {
    this.attachHandlers.push(handler);
  }

  /**
   * Register a handler that will be called before attachment deletion
   * @param {(attachmentId: string) => Promise<void>} handler
   */
  addDetachHandler(handler) {
    this.detachHandlers.push(handler);
  }

}

module.exports = AttachmentService;
