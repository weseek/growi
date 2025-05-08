import loggerFactory from '~/utils/logger';

import { AttachmentType } from '../interfaces/attachment';
import { Attachment } from '../models/attachment';

const fs = require('fs');

const mongoose = require('mongoose');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:service:AttachmentService');

/**
 * the service class for Attachment and file-uploader
 */
class AttachmentService {

  /** @type {Array<(pageId: string, file: Express.Multer.File, readable: Readable) => Promise<void>>} */
  attachHandlers = [];

  detachHandlers = [];

  /** @type {import('~/server/crowi').default} Crowi instance */
  crowi;

  /** @param {import('~/server/crowi').default} crowi Crowi instance */
  constructor(crowi) {
    this.crowi = crowi;
  }

  async createAttachment(file, user, pageId = null, attachmentType, onAttached) {
    const { fileUploadService } = this.crowi;

    // check limit
    const res = await fileUploadService.checkLimit(file.size);
    if (!res.isUploadable) {
      throw new Error(res.errorMessage);
    }

    const fileStream = fs.createReadStream(file.path, {
      flags: 'r', encoding: null, fd: null, mode: '0666', autoClose: true,
    });

    // create an Attachment document and upload file
    let attachment;
    try {
      const attachedHandlerPromises = this.attachHandlers.map((handler) => {
        return handler(pageId, file, fileStream);
      });

      Promise.all(attachedHandlerPromises);

      attachment = Attachment.createWithoutSave(pageId, user, file.originalname, file.mimetype, file.size, attachmentType);
      await fileUploadService.uploadAttachment(fileStream, attachment);
      await attachment.save();
    }
    catch (err) {
      // delete temporary file
      fs.unlink(file.path, (err) => { if (err) { logger.error('Error while deleting tmp file.') } });
      throw err;
    }
    finally {
      onAttached?.(file);

      // TODO: move later
      this.attachHandlers = [];
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
   * @param {(attachment: Attachment) => Promise<void>} handler
   */
  addDetachHandler(handler) {
    this.detachHandlers.push(handler);
  }

}

module.exports = AttachmentService;
