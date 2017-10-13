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

  api.redirector = function(req, res, next){
    var id = req.params.id;

    Attachment.findById(id)
    .then(function(data) {

      // TODO: file delivery plugin for cdn
      Attachment.findDeliveryFile(data)
      .then(fileName => {
        const encodedFileName = encodeURIComponent(data.originalName);

        var deliveryFile = {
          fileName: fileName,
          options: {
            headers: {
              'Content-Type': data.fileFormat,
              'Content-Disposition': `inline;filename*=UTF-8''${encodedFileName}`,
            },
          },
        };

        if (deliveryFile.fileName.match(/^\/uploads/)) {
          debug('Using loacal file module, just redirecting.')
          return res.redirect(deliveryFile.fileName);
        } else {
          return res.sendFile(deliveryFile.fileName, deliveryFile.options);
        }
      }).catch(err => {
        //debug('error', err);
      });
    }).catch((err) => {
      //debug('err', err);
      // not found
      return res.status(404).sendFile(crowi.publicDir + '/images/file-not-found.png');
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

      // NOTE: use original fileUrl directly (not proxy) -- 2017.05.08 Yuki Takei
      // reason:
      //   1. this is buggy (doesn't work on Win)
      //   2. ensure backward compatibility of data

      // var config = crowi.getConfig();
      // var baseUrl = (config.crowi['app:url'] || '');
      return res.json(ApiResponse.success({
        attachments: attachments.map(at => {
          var fileUrl = at.fileUrl;
          at = at.toObject();
          // at.url = baseUrl + fileUrl;
          at.url = fileUrl;
          return at;
        })
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
          var fileUrl = data.fileUrl;
          var config = crowi.getConfig();

          // isLocalUrl??
          if (!fileUrl.match(/^https?/)) {
            fileUrl = (config.crowi['app:url'] || '') + fileUrl;
          }

          var result = {
            page: page.toObject(),
            attachment: data.toObject(),
            url: fileUrl,
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

  /**
   * @api {post} /attachments.remove Remove attachments
   * @apiName RemoveAttachments
   * @apiGroup Attachment
   *
   * @apiParam {String} attachment_id
   */
  api.remove = function(req, res){
    const id = req.body.attachment_id;

    Attachment.findById(id)
    .then(function(data) {
      const attachment = data;

      Attachment.removeAttachment(attachment)
      .then(data => {
        debug('removeAttachment', data);
        return res.json(ApiResponse.success({}));
      }).catch(err => {
        return res.status(500).json(ApiResponse.error('Error while deleting file'));
      });
    }).catch(err => {
      debug('Error', err);
      return res.status(404);
    });
  };

  return actions;
};
