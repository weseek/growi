module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:attachment')
    , mongoose = require('mongoose')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , Promise = require('bluebird')
  ;

  function generateFileHash (fileName) {
    var hasher = require('crypto').createHash('md5');
    hasher.update(fileName);

    return hasher.digest('hex');
  }

  attachmentSchema = new mongoose.Schema({
    page: { type: ObjectId, ref: 'Page' },
    creator: { type: ObjectId, ref: 'User' },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    fileFormat: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });

  attachmentSchema.statics.getListByPageId = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {

      self
        .find({page: id})
        .sort('updatedAt', -1)
        .exec(function(err, data) {
          if (err) {
            return reject(err);
          }

          if (data.length < 1) {
            return resolve([]);
          }

          return data.populate(
            [{path: 'creator', model: 'User'}],
            function (err, populatedData) {
              return resolve(populatedData);
            }
          );
        });
    });
  };

  attachmentSchema.statics.create = function(pageId, creator, filePath, fileName, fileFormat) {
    var Attachment = this;

    return new Promise(function(resolve, reject) {
      var newAttachment = new Attachment();

      newAttachment.page = pageId;
      newAttachment.creator = creator._id;
      newAttachment.filePath = filePath;
      newAttachment.fileName = fileName;
      newAttachment.fileFormat = fileFormat;
      newAttachment.createdAt = Date.now();

      newAttachment.save(function(err, data) {
        debug('Attachment saved.', data);
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  };

  attachmentSchema.statics.createAttachmentFilePath = function (pageId, fileName, fileType) {
    var ext = '.' + fileName.match(/(.*)(?:\.([^.]+$))/)[2];

    return 'attachment/' + pageId + '/' + generateFileHash(fileName) + ext;
  };

  return mongoose.model('Attachment', attachmentSchema);
};
