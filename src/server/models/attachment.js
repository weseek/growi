// disable no-return-await for model functions
/* eslint-disable no-return-await */

const debug = require('debug')('growi:models:attachment');
// eslint-disable-next-line no-unused-vars
const logger = require('@alias/logger')('growi:models:attachment');
const path = require('path');

const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = function(crowi) {
  function generateFileHash(fileName) {
    const hash = require('crypto').createHash('md5');
    hash.update(`${fileName}_${Date.now()}`);

    return hash.digest('hex');
  }

  const attachmentSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    creator: { type: ObjectId, ref: 'User', index: true },
    filePath: { type: String }, // DEPRECATED: remains for backward compatibility for v3.3.x or below
    fileName: { type: String, required: true },
    originalName: { type: String },
    fileFormat: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  });

  attachmentSchema.virtual('filePathProxied').get(function() {
    return `/attachment/${this._id}`;
  });

  attachmentSchema.virtual('downloadPathProxied').get(function() {
    return `/download/${this._id}`;
  });

  attachmentSchema.set('toObject', { virtuals: true });
  attachmentSchema.set('toJSON', { virtuals: true });


  attachmentSchema.statics.create = async function(pageId, user, fileStream, originalName, fileFormat, fileSize) {
    const fileUploader = require('../service/file-uploader')(crowi);
    const Attachment = this;

    const extname = path.extname(originalName);
    let fileName = generateFileHash(originalName);
    if (extname.length > 1) { // ignore if empty or '.' only
      fileName = `${fileName}${extname}`;
    }

    let attachment = new Attachment();
    attachment.page = pageId;
    attachment.creator = user._id;
    attachment.originalName = originalName;
    attachment.fileName = fileName;
    attachment.fileFormat = fileFormat;
    attachment.fileSize = fileSize;
    attachment.createdAt = Date.now();

    // upload file
    await fileUploader.uploadFile(fileStream, attachment);
    // save attachment
    attachment = await attachment.save();

    return attachment;
  };

  attachmentSchema.statics.removeAttachmentsByPageId = async function(pageId) {
    const attachments = this.find({ page: pageId });

    const promises = attachments.map((attachment) => {
      return this.removeWithSubstanceById(attachment._id);
    });

    return Promise.all(promises);
  };

  attachmentSchema.statics.removeWithSubstanceById = async function(id) {
    const fileUploader = require('../service/file-uploader')(crowi);
    // retrieve data from DB to get a completely populated instance
    const attachment = await this.findById(id);
    await fileUploader.deleteFile(attachment);
    return await attachment.remove();
  };

  return mongoose.model('Attachment', attachmentSchema);
};
