const logger = require('@alias/logger')('growi:service:AttachmentService'); // eslint-disable-line no-unused-vars

const fs = require('fs');
const mongoose = require('mongoose');


/**
 * the service class for Attachment and file-uploader
 */
class AttachmentService {

  constructor(crowi) {
    this.crowi = crowi;
  }

  async createAttachment(file, user, pageId = null) {
    const { fileUploadService } = this.crowi;

    // check limit
    const res = await fileUploadService.checkLimit(file.size);
    if (!res.isUploadable) {
      throw new Error(res.errorMessage);
    }

    const Attachment = this.crowi.model('Attachment');

    const fileStream = fs.createReadStream(file.path, {
      flags: 'r', encoding: null, fd: null, mode: '0666', autoClose: true,
    });

    // create an Attachment document and upload file
    let attachment;
    try {
      attachment = Attachment.createWithoutSave(pageId, user, fileStream, file.originalname, file.mimetype, file.size);
      await fileUploadService.uploadFile(fileStream, attachment);
      await attachment.save();
    }
    catch (err) {
      // delete temporary file
      fs.unlink(file.path, (err) => { if (err) { logger.error('Error while deleting tmp file.') } });
      throw err;
    }

    return attachment;
  }

  async removeAttachment(attachments) {
    const { fileUploadService } = this.crowi;
    const attachmentsCollection = mongoose.connection.collection('attachments');
    // const attachmentsFilesChunkCollection = mongoose.connection.collection('attachmentFiles.chunks');
    // const attachmentsFilesFilesColleciton = mongoose.connection.collection('attachmentFiles.files');
    const unorderAttachmentsBulkOp = attachmentsCollection.initializeUnorderedBulkOp();
    // const unorderAttachmentsFilesChunkBulkOp = attachmentsFilesChunkCollection.initializeOrderedBulkOp();
    // const unorderAttachmentsFilesFilesBulkOp = attachmentsFilesFilesColleciton.initializeOrderedBulkOp();

    attachments.forEach((attachment) => {
      fileUploadService.deleteFile(attachment);
      // unorderAttachmentsFilesChunkBulkOp.find({ _id: attachment._id }).remove();
      // unorderAttachmentsFilesFilesBulkOp.find({ _id: attachment._id }).remove();
      unorderAttachmentsBulkOp.find({ _id: attachment._id }).remove();
    });

    // await unorderAttachmentsFilesChunkBulkOp.execute();
    // await unorderAttachmentsFilesFilesBulkOp.execute();
    await unorderAttachmentsBulkOp.execute();
    return;
  }

}

module.exports = AttachmentService;
