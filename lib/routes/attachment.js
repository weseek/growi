module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routs:attachment')
    ,  Attachment = crowi.model('Attachment')
    , User = crowi.model('User')
    , fs = require('fs')
    , actions = {}
    , api = {};

  actions.api = api;

  api.list = function(req, res){
    var id = req.params.pageId;

    Attachment.getListByPageId(id)
    .then(function(attachments) {
      res.json({
        status: true,
        data: {
          attachments: attachments
        }
      });
    });
  };

  /**
   *
   */
  api.add = function(req, res){
    var id = req.params.pageId;
    if (id == 0) {
      // TODO create page before process upload
    }

    var fileUploader = require('../util/fileUploader')(crowi, app);
    var tmpFile = req.files.file || null;
    if (!tmpFile) {
      return res.json({
        status: false,
        message: 'File error.'
      });
    }

    var tmpPath = tmpFile.path,
      fileName = tmpFile.name,
      fileType = tmpFile.mimetype,
      filePath = Attachment.createAttachmentFilePath(id, fileName, fileType);

    fileUploader.uploadFile(
      filePath,
      fileType,
      fs.createReadStream(tmpPath, {
        flags: 'r',
        encoding: null,
        fd: null,
        mode: '0666',
        autoClose: true
      }),
      {})
    .then(function(data) {

      Attachment.create(id, req.user, filePath, fileName, fileType)
      .then(function(data) {
        debug('Succesfully save attachment data', data);

        var imageUrl = fileUploader.generateS3FileUrl(data.filePath);
        return res.json({
          status: true,
          filename: imageUrl,
          attachment: data,
          message: 'Successfully uploaded.',
        });
      }, function (err) {
        debug('Error on saving attachment data', err);

        return res.json({
          status: false,
          message: '',
        });
      }).finally(function() {
        fs.unlink(tmpPath, function (err) {
          if (err) {
            debug('Error while deleting tmp file.');
          }
        });
      });

    }, function(err) {
      debug('Upload error to S3.', err);

      return res.json({
        status: false,
        message: 'Error while uploading.',
      });
    });
  };

  api.remove = function(req, res){
    var id = req.params.id;
  };

  return actions;
};
