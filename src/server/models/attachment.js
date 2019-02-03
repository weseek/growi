const debug = require('debug')('growi:models:attachment');
const logger = require('@alias/logger')('growi:models:attachment');
const path = require('path');

const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = function(crowi) {
  const fileUploader = require('../service/file-uploader')(crowi);

  let attachmentSchema;

  function generateFileHash(fileName) {
    const hash = require('crypto').createHash('md5');
    hash.update(`${fileName}_${Date.now()}`);

    return hash.digest('hex');
  }


  attachmentSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    creator: { type: ObjectId, ref: 'User', index: true  },
    filePath: { type: String },   // DEPRECATED: remains for backward compatibility for v3.3.7 or below
    fileName: { type: String, required: true },
    originalName: { type: String },
    fileFormat: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now() },
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
    const Attachment = this;

    const extname = path.extname(originalName);
    let fileName = generateFileHash(originalName);
    if (extname.length > 1) {   // ignore if empty or '.' only
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

  attachmentSchema.statics.removeAttachmentsByPageId = function(pageId) {
    var Attachment = this;

    return new Promise((resolve, reject) => {
      Attachment.find({ page: pageId})
      .then((attachments) => {
        for (let attachment of attachments) {
          Attachment.removeWithSubstance(attachment).then((res) => {
            // do nothing
          }).catch((err) => {
            debug('Attachment remove error', err);
          });
        }

        resolve(attachments);
      }).catch((err) => {
        reject(err);
      });
    });

  };

  attachmentSchema.statics.removeWithSubstance = async function(attachment) {
    // retrieve data from DB
    // because this instance fields are only partially populated
    const att = await this.findById(attachment._id);
    await fileUploader.deleteFile(att);
    return await this.remove();
  };

  return mongoose.model('Attachment', attachmentSchema);
};
