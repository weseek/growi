module.exports = function(crowi, app) {
  'use strict';

  var debug = require('debug')('crowi:routs:attachment')
    , Attachment = crowi.model('Attachment')
    , User = crowi.model('User')
    , Page = crowi.model('Page')
    , config = crowi.getConfig()
    , fs = require('fs')
    , fileUploader = require('../util/fileUploader')(crowi, app)
    , ApiResponse = require('../util/apiResponse')
    , actions = {}
    , api = {};

  actions.api = api;

  api.redirector = function(req, res){
    var id = req.params.id;

    Attachment.findById(id)
    .then(function(data) {

      // TODO: file delivery plugin for cdn
      var deliveryFile = Attachment.findDeliveryFile(data);
      return res.sendFile(deliveryFile.filename, deliveryFile.options);
    }).catch(function(err) {

      // not found
      return res.sendFile(crowi.publicDir + '/images/file-not-found.png');
    });
  };

  /**
   * @api {get} /attachments.list Get attachments of the page
   * @apiName ListAttachments
   * @apiGroup Attachment
   *
   * @apiParam {String} page_id
   */
  api.list = function(req, res){
    var id = req.query.page_id || null;
    if (!id) {
      return res.json(ApiResponse.error('Parameters page_id is required.'));
    }

    Attachment.getListByPageId(id)
    .then(function(attachments) {
      return res.json(ApiResponse.success({
        attachments: attachments
      }));
    });
  };

  /**
   * @api {post} /attachments.add Add attachment to the page
   * @apiName AddAttachments
   * @apiGroup Attachment
   *
   * @apiParam {String} page_id
   * @apiParam {File} file
   */
  api.add = function(req, res){
    var id = req.body.page_id || 0,
      path = decodeURIComponent(req.body.path) || null,
      pageCreated = false,
      page = {};

    debug('id and path are: ', id, path);

    var tmpFile = req.file || null;
    debug('Uploaded tmpFile: ', tmpFile);
    if (!tmpFile) {
      return res.json(ApiResponse.error('File error.'));
    }

    new Promise(function(resolve, reject) {
      if (id == 0) {
        if (path === null) {
          throw new Error('path required if page_id is not specified.');
        }
        debug('Create page before file upload');
        Page.create(path, '# '  + path, req.user, {grant: Page.GRANT_OWNER})
          .then(function(page) {
            pageCreated = true;
            resolve(page);
          })
          .catch(reject);
      } else {
        Page.findPageById(id).then(resolve).catch(reject);
      }
    }).then(function(pageData) {
      page = pageData;
      id = pageData._id;

      var tmpPath = tmpFile.path,
        originalName = tmpFile.originalname,
        fileName = tmpFile.filename + tmpFile.originalname,
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
          var imageUrl = fileUploader.generateUrl(data.filePath);
          var result = {
            page: page.toObject(),
            attachment: data.toObject(),
            filename: imageUrl,
            pageCreated: pageCreated,
          };

          result.page.creator = User.filterToPublicFields(result.page.creator);
          result.attachment.creator = User.filterToPublicFields(result.attachment.creator);

          // delete anyway
          fs.unlink(tmpPath, function (err) { if (err) { debug('Error while deleting tmp file.'); } });

          return res.json(ApiResponse.success(result));
        }).catch(function (err) {
          debug('Error on saving attachment data', err);
          // @TODO
          // Remove from S3

          // delete anyway
          fs.unlink(tmpPath, function (err) { if (err) { debug('Error while deleting tmp file.'); } });

          return res.json(ApiResponse.error('Error while uploading.'));
        });
      ;
    }).catch(function(err) {
      debug('Attachement upload error', err);
      return res.json(ApiResponse.error('Error.'));
    });
  };

  api.remove = function(req, res){
    var id = req.params.id;
  };

  return actions;
};
