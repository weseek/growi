module.exports = function(crowi) {
  var debug = require('debug')('growi:models:attachment')
    , mongoose = require('mongoose')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , fileUploader = require('../service/file-uploader')(crowi)
    , attachmentSchema
  ;

  function generateFileHash(fileName) {
    var hasher = require('crypto').createHash('md5');
    hasher.update(fileName);

    return hasher.digest('hex');
  }

  attachmentSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page', index: true },
    creator: { type: ObjectId, ref: 'User', index: true  },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    originalName: { type: String },
    fileFormat: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  }, {
    toJSON: {
      virtuals: true
    },
  });

  attachmentSchema.virtual('fileUrl').get(function() {
    // NOTE: use original generated Url directly (not proxy) -- 2017.05.08 Yuki Takei
    // reason:
    //   1. this is buggy (doesn't work on Win)
    //   2. ensure backward compatibility of data

    // return `/files/${this._id}`;
     return fileUploader.generateUrl(this.filePath);
  });

  attachmentSchema.statics.findById = function(id) {
    var Attachment = this;

    return new Promise(function(resolve, reject) {
      Attachment.findOne({_id: id}, function(err, data) {
        if (err) {
          return reject(err);
        }

        if (data === null) {
          return reject(new Error('Attachment not found'));
        }
        return resolve(data);
      });
    });
  };

  attachmentSchema.statics.getListByPageId = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {

      self
        .find({page: id})
        .sort({'updatedAt': 1})
        .populate('creator')
        .exec(function(err, data) {
          if (err) {
            return reject(err);
          }

          if (data.length < 1) {
            return resolve([]);
          }

          debug(data);
          return resolve(data);
        });
    });
  };

  attachmentSchema.statics.create = function(pageId, creator, filePath, originalName, fileName, fileFormat, fileSize) {
    var Attachment = this;

    return new Promise(function(resolve, reject) {
      var newAttachment = new Attachment();

      newAttachment.page = pageId;
      newAttachment.creator = creator._id;
      newAttachment.filePath = filePath;
      newAttachment.originalName = originalName;
      newAttachment.fileName = fileName;
      newAttachment.fileFormat = fileFormat;
      newAttachment.fileSize = fileSize;
      newAttachment.createdAt = Date.now();

      newAttachment.save(function(err, data) {
        if (err) {
          debug('Error on saving attachment.', err);
          return reject(err);
        }
        debug('Attachment saved.', data);
        return resolve(data);
      });
    });
  };

  attachmentSchema.statics.guessExtByFileType = function(fileType) {
    let ext = '';
    const isImage = fileType.match(/^image\/(.+)/i);

    if (isImage) {
      ext = isImage[1].toLowerCase();
    }

    return ext;
  };

  attachmentSchema.statics.createAttachmentFilePath = function(pageId, fileName, fileType) {
    const Attachment = this;
    let ext = '';
    const fnExt = fileName.match(/(.*)(?:\.([^.]+$))/);

    if (fnExt) {
      ext = '.' + fnExt[2];
    }
    else {
      ext = Attachment.guessExtByFileType(fileType);
      if (ext !== '') {
        ext = '.' + ext;
      }
    }

    return 'attachment/' + pageId + '/' + generateFileHash(fileName) + ext;
  };

  attachmentSchema.statics.removeAttachmentsByPageId = function(pageId) {
    var Attachment = this;

    return new Promise((resolve, reject) => {
      Attachment.getListByPageId(pageId)
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

  attachmentSchema.statics.findDeliveryFile = function(attachment, forceUpdate) {
    // TODO force update
    // var forceUpdate = forceUpdate || false;

    return fileUploader.findDeliveryFile(attachment._id, attachment.filePath);
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
