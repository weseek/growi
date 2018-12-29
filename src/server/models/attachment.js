module.exports = function(crowi) {
  const debug = require('debug')('growi:models:attachment');
  const mongoose = require('mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;

  const urljoin = require('url-join');

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
    filePath: { type: String },   // DEPRECATED: remains for backward compatibility for v3.3.3 or below
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

  attachmentSchema.methods.getFilePathOnStorage = function() {
    if (this.filePath != null) {
      return this.filePath;
    }

    const pageId = this.page._id || this.page;
    const filePath = urljoin('/attachment', pageId.toString(), this.fileName);

    return filePath;
  };

  attachmentSchema.statics.create = async function(pageId, user, fileStream, originalName, fileFormat, fileSize) {
    const Attachment = this;

    const fileName = generateFileHash(originalName);

    // upload file
    await fileUploader.uploadFile(fileStream, fileName, fileFormat);

    let attachment = new Attachment();
    attachment.page = pageId;
    attachment.creator = user._id;
    attachment.originalName = originalName;
    attachment.fileName = fileName;
    attachment.fileFormat = fileFormat;
    attachment.fileSize = fileSize;
    attachment.createdAt = Date.now();

    return await attachment.save();
  };

  attachmentSchema.statics.removeAttachmentsByPageId = function(pageId) {
    var Attachment = this;

    return new Promise((resolve, reject) => {
      Attachment.find({ page: pageId})
      .then((attachments) => {
        for (let attachment of attachments) {
          Attachment.removeAttachment(attachment).then((res) => {
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

  attachmentSchema.statics.removeAttachment = function(attachment) {
    const Attachment = this;
    const filePath = attachment.filePath;

    return new Promise((resolve, reject) => {
      Attachment.remove({_id: attachment._id}, (err, data) => {
        if (err) {
          return reject(err);
        }

        fileUploader.deleteFile(attachment._id, filePath)
        .then(data => {
          resolve(data); // this may null
        }).catch(err => {
          reject(err);
        });
      });
    });
  };

  return mongoose.model('Attachment', attachmentSchema);
};
