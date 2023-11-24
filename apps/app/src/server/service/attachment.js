import loggerFactory from '~/utils/logger';

import { AttachmentType } from '../interfaces/attachment';
import { Attachment } from '../models';

const fs = require('fs');

const mongoose = require('mongoose');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:service:AttachmentService');

/**
 * the service class for Attachment and file-uploader
 */
class AttachmentService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  async createAttachment(file, user, pageId = null, attachmentType) {
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
      attachment = Attachment.createWithoutSave(pageId, user, fileStream, file.originalname, file.mimetype, file.size, attachmentType);
      await fileUploadService.uploadAttachment(fileStream, attachment);
      await attachment.save();
    }
    catch (err) {
      // delete temporary file
      fs.unlink(file.path, (err) => { if (err) { logger.error('Error while deleting tmp file.') } });
      throw err;
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

}

module.exports = AttachmentService;
