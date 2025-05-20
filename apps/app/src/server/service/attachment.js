import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

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

  /** @type {Array<(pageId: string, attachment: Attachment, file: Express.Multer.File, buffer: Buffer) => Promise<void>>} */
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

      if (this.attachHandlers.length === 0) {
        disposeTmpFileCallback?.(file);
        return attachment;
      }

      const readStreamForAttacheHandler = createReadStream(file.path);
      const chunks = [];
      const attachHandlers = this.attachHandlers;

      const attachedHandlerStream = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
          chunks.push(chunk);
          callback(null, chunk);
        },

        async flush(callback) {
          // At this point we have the complete file as a Buffer
          // This approach assumes handler needs the complete file data
          const completeData = Buffer.concat(chunks);

          const promises = attachHandlers.map((handler) => {
            return handler(pageId, attachment, file, completeData);
          });

          await Promise.all(promises)
            .then(() => {
              callback();
            })
            .catch((err) => {
              logger.error('Error while executing attach handler', err);
              callback(err);
            });
        },
      });

      // Do not await, run in background
      pipeline(readStreamForAttacheHandler, attachedHandlerStream)
        .catch((err) => {
          logger.error('Error in stream processing', err);
        })
        .finally(() => {
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
   * @param {(pageId: string, attachment: Attachment, file: Express.Multer.File, buffer: Buffer) => Promise<void>} handler
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
