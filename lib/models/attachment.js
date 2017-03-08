module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:attachment')
    , mongoose = require('mongoose')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , fileUploader = require('../util/fileUploader')(crowi)
  ;

  function generateFileHash (fileName) {
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
    createdAt: { type: Date, default: Date.now }
  }, {
    toJSON: {
      virtuals: true
    }
  });

  attachmentSchema.virtual('fileUrl').get(function() {
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

  attachmentSchema.statics.createAttachmentFilePath = function (pageId, fileName, fileType) {
    var ext = '.' + fileName.match(/(.*)(?:\.([^.]+$))/)[2] || '';

    return 'attachment/' + pageId + '/' + generateFileHash(fileName) + ext;
  };

  attachmentSchema.statics.removeAttachmentsByPageId = function(pageId) {
    var Attachment = this;

    // todo
    return Promise.resolve();
    //return new Promise(function(resolve, reject) {
    //  // target find
    //  Attachment.getListByPageId(pageId)
    //  .then(function(attachments) {
    //  }).then(function(done) {
    //  }).catch(function(err) {
    //  });
    //});

  };

  attachmentSchema.statics.createCacheFileName = function(attachment) {
    return crowi.cacheDir + 'attachment-' + attachment._id;
  };

  attachmentSchema.statics.findDeliveryFile = function(attachment) {
    // find local
    var fs = require('fs');
    var deliveryFile = {
      filename: '',
      options: {
        headers: {
          'Content-Type': attachment.fileFormat,
        },
      },
    };
    var cacheFileName = this.createCacheFileName(attachment);
    // とちゅう
    return deliveryFile;
  };

  return mongoose.model('Attachment', attachmentSchema);
};
