const logger = require('@alias/logger')('growi:service:AttachmentService'); // eslint-disable-line no-unused-vars

const fs = require('fs');


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
    const res = await fileUploadService.fileUploader.checkLimit(file.size);
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
      await fileUploadService.fileUploader.uploadFile(fileStream, attachment);
      await attachment.save();
    }
    catch (err) {
      // delete temporary file
      fs.unlink(file.path, (err) => { if (err) { logger.error('Error while deleting tmp file.') } });
      throw err;
    }

    return attachment;
  }

  async removeAttachment(attachmentId) {
    const Attachment = this.crowi.model('Attachment');
    const { fileUploadService } = this.crowi;

    const attachment = await Attachment.findById(attachmentId);
    await fileUploadService.fileUploader.deleteFile(attachment);

    return attachment.remove();
  }

}

module.exports = AttachmentService;
