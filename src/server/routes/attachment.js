const debug = require('debug')('growi:routss:attachment');
const logger = require('@alias/logger')('growi:routes:attachment');

const path = require('path');
const fs = require('fs');

const ApiResponse = require('../util/apiResponse');

module.exports = function(crowi, app) {
  const Attachment = crowi.model('Attachment');
  const User = crowi.model('User');
  const Page = crowi.model('Page');
  const fileUploader = require('../service/file-uploader')(crowi, app);


  /**
   * Common method to response
   *
   * @param {Response} res
   * @param {Attachment} attachment
   * @param {boolean} forceDownload
   */
  async function responseForAttachment(res, attachment, forceDownload) {
    let fileStream;
    try {
      fileStream = await fileUploader.findDeliveryFile(attachment);
    }
    catch (e) {
      logger.error(e);
      return res.json(ApiResponse.error(e.message));
    }

    setHeaderToRes(res, attachment, forceDownload);
    return fileStream.pipe(res);
  }

  /**
   * set http response header
   *
   * @param {Response} res
   * @param {Attachment} attachment
   * @param {boolean} forceDownload
   */
  function setHeaderToRes(res, attachment, forceDownload) {
    // download
    if (forceDownload) {
      const headers = {
        'Content-Type': 'application/force-download',
        'Content-Disposition': `inline;filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
      };

      res.writeHead(200, headers);
    }
    // reference
    else {
      res.set('Content-Type', attachment.fileFormat);
    }
  }


  const actions = {};
  const api = {};

  actions.api = api;

  api.download = async function(req, res) {
    const id = req.params.id;

    const attachment = await Attachment.findById(id);

    if (attachment == null) {
      return res.json(ApiResponse.error('attachment not found'));
    }

    // TODO for GC-1359: consider restriction

    return responseForAttachment(res, attachment, true);
  };

  /**
   * @api {get} /attachments.get get attachments
   * @apiName get
   * @apiGroup Attachment
   *
   * @apiParam {String} id
   */
  api.get = async function(req, res) {
    const id = req.params.id;

    const attachment = await Attachment.findById(id);

    if (attachment == null) {
      return res.json(ApiResponse.error('attachment not found'));
    }

    // TODO for GC-1359: consider restriction

    return responseForAttachment(res, attachment);
  };

  /**
   * @api {get} /attachments.obsoletedGetForMongoDB get attachments from mongoDB
   * @apiName get
   * @apiGroup Attachment
   *
   * @apiParam {String} pageId, fileName
   */
  api.obsoletedGetForMongoDB = async function(req, res) {
    if (process.env.FILE_UPLOAD !== 'mongodb') {
      return res.status(400);
    }

    const pageId = req.params.pageId;
    const fileName = req.params.fileName;
    const filePath = `attachment/${pageId}/${fileName}`;

    const attachment = await Attachment.findOne({ filePath });

    if (attachment == null) {
      return res.json(ApiResponse.error('attachment not found'));
    }

    // TODO for GC-1359: consider restriction

    return responseForAttachment(res, attachment);
  };

  /**
   * @api {get} /attachments.list Get attachments of the page
   * @apiName ListAttachments
   * @apiGroup Attachment
   *
   * @apiParam {String} page_id
   */
  api.list = async function(req, res) {
    const id = req.query.page_id || null;
    if (!id) {
      return res.json(ApiResponse.error('Parameters page_id is required.'));
    }

    let attachments = await Attachment.find({page: id})
      .sort({'updatedAt': 1})
      .populate('creator', User.USER_PUBLIC_FIELDS);

    attachments = attachments.map(attachment => attachment.toObject({ virtuals: true }));

    return res.json(ApiResponse.success({ attachments }));
  };

  /**
   * @api {get} /attachments.limit get available capacity of uploaded file with GridFS
   * @apiName AddAttachments
   * @apiGroup Attachment
   */
  api.limit = async function(req, res) {
    const isUploadable = await fileUploader.checkCapacity(req.query.fileSize);
    return res.json(ApiResponse.success({isUploadable: isUploadable}));
  };

  /**
   * @api {post} /attachments.add Add attachment to the page
   * @apiName AddAttachments
   * @apiGroup Attachment
   *
   * @apiParam {String} page_id
   * @apiParam {File} file
   */
  api.add = async function(req, res) {
    const pageId = req.body.page_id || null;
    const pagePath = decodeURIComponent(req.body.path) || null;
    let pageCreated = false;

    // check params
    if (pageId == null && pagePath == null) {
      return res.json(ApiResponse.error('Either page_id or path is required.'));
    }
    if (!req.file) {
      return res.json(ApiResponse.error('File error.'));
    }

    const file = req.file;

    // check capacity
    const isUploadable = await fileUploader.checkCapacity(file.size);
    if (!isUploadable) {
      return res.json(ApiResponse.error('MongoDB for uploading files reaches limit'));
    }

    // TODO for GC-1359: consider restriction
    let page;
    if (pageId == null) {
      debug('Create page before file upload');
      page = await Page.create(path, '# '  + path, req.user, {grant: Page.GRANT_OWNER});
      pageCreated = true;
    }
    else {
      page = await Page.findById(pageId);
    }

    const fileStream = fs.createReadStream(file.path, {flags: 'r', encoding: null, fd: null, mode: '0666', autoClose: true });

    // create an Attachment document and upload file
    let attachment;
    try {
      attachment = await Attachment.create(pageId, req.user, fileStream, file.originalname, file.mimetype, file.size);
    }
    catch (err) {
      logger.error(err);

      // delete anyway
      fs.unlink(file.path, function(err) { if (err) { logger.error('Error while deleting tmp file.') } });

      return res.json(ApiResponse.error('Error while uploading'));
    }

    const result = {
      page: page.toObject(),
      attachment: attachment.toObject({ virtuals: true }),
      pageCreated: pageCreated,
    };

    return res.json(ApiResponse.success(result));
  };

  /**
   * @api {post} /attachments.remove Remove attachments
   * @apiName RemoveAttachments
   * @apiGroup Attachment
   *
   * @apiParam {String} attachment_id
   */
  api.remove = function(req, res) {
    const id = req.body.attachment_id;

    Attachment.findById(id)
    .then(function(data) {
      const attachment = data;

      Attachment.removeAttachment(attachment)
      .then(data => {
        debug('removeAttachment', data);
        return res.json(ApiResponse.success({}));
      }).catch(err => {
        logger.error('Error', err);
        return res.status(500).json(ApiResponse.error('Error while deleting file'));
      });
    }).catch(err => {
      logger.error('Error', err);
      return res.status(404);
    });
  };

  return actions;
};
