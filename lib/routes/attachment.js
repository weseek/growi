module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routs:attachment')
    , Attachment = crowi.model('Attachment')
    , User = crowi.model('User')
    , Page = crowi.model('Page')
    , Promise = require('bluebird')
    , config = crowi.getConfig()
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
          fileBaseUrl: 'https://' + config.crowi['aws:bucket'] +'.s3.amazonaws.com/', // FIXME: ベタ書きよくない
          attachments: attachments
        }
      });
    });
  };

  /**
   *
   */
  api.add = function(req, res){
    var id = req.params.pageId,
      path = decodeURIComponent(req.body.path),
      pageCreated = false,
      page = {};

    debug('id and path are: ', id, path);

    var fileUploader = require('../util/fileUploader')(crowi, app);
    var tmpFile = req.files.file || null;
    debug('Uploaded tmpFile: ', tmpFile);
    if (!tmpFile) {
      return res.json({
        status: false,
        message: 'File error.'
      });
    }

    new Promise(function(resolve, reject) {
      if (id == 0) {
        debug('Create page before file upload');
        Page.create(path, '# '  + path, req.user, {grant: Page.GRANT_OWNER}, function(err, pageData) {
          if (err) {
            debug('Page create error', err);
            return reject(err);
          }
          pageCreated = true;
          return resolve(pageData);
        });
      } else {
        Page.findPageById(id).then(resolve).catch(reject);
      }
    }).then(function(pageData) {
      page = pageData;
      id = pageData._id;

      var tmpPath = tmpFile.path,
        originalName = tmpFile.originalname,
        fileName = tmpFile.name,
        fileType = tmpFile.mimetype,
        fileSize = tmpFile.size,
        filePath = Attachment.createAttachmentFilePath(id, fileName, fileType),
        tmpFileStream = fs.createReadStream(tmpPath, {flags: 'r', encoding: null, fd: null, mode: '0666', autoClose: true });

      return fileUploader.uploadFile(filePath, fileType, tmpFileStream, {})
        .then(function(data) {
          debug('Uploaded data is: ', data);

          // TODO size
          return Attachment.create(id, req.user, filePath, originalName, fileName, fileType, fileSize);
        }).then(function(data) {
          var imageUrl = fileUploader.generateS3FileUrl(data.filePath);
          return res.json({
            status: true,
            filename: imageUrl,
            attachment: data,
            page: page,
            pageCreated: pageCreated,
            message: 'Successfully uploaded.',
          });
        }).catch(function (err) {
          debug('Error on saving attachment data', err);
          // @TODO
          // Remove from S3
          return res.json({
            status: false,
            message: 'Error while uploading.',
          });
        }).finally(function() {
          fs.unlink(tmpPath, function (err) {
            if (err) {
              debug('Error while deleting tmp file.');
            }
          });
        })
      ;
    });
  };

  api.remove = function(req, res){
    var id = req.params.id;
  };

  return actions;
};
