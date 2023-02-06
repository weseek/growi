import { createReadStream } from 'fs';
import path from 'path';

import { ErrorV3 } from '@growi/core';
import express, { NextFunction, Request, Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';

import { isG2GTransferError } from '~/server/models/vo/g2g-transfer-error';
import { IDataGROWIInfo, X_GROWI_TRANSFER_KEY_HEADER_NAME } from '~/server/service/g2g-transfer';
import loggerFactory from '~/utils/logger';
import { TransferKey } from '~/utils/vo/transfer-key';


import Crowi from '../../crowi';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';

import { ApiV3Response } from './interfaces/apiv3-response';

interface AuthorizedRequest extends Request {
  user?: any
}

const logger = loggerFactory('growi:routes:apiv3:transfer');

const validator = {
  transfer: [
    body('transferKey').isString().withMessage('transferKey is required'),
    body('collections').isArray().withMessage('collections is required'),
    body('optionsMap').isObject().withMessage('optionsMap is required'),
  ],
};

/*
 * Routes
 */
module.exports = (crowi: Crowi): Router => {
  const {
    g2gTransferPusherService, g2gTransferReceiverService, exportService, importService,
    growiBridgeService, configManager,
  } = crowi;
  if (g2gTransferPusherService == null || g2gTransferReceiverService == null || exportService == null || importService == null
    || growiBridgeService == null || configManager == null) {
    throw Error('GROWI is not ready for g2g transfer');
  }

  const uploads = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, importService.baseDir);
      },
      filename(req, file, cb) {
        // to prevent hashing the file name. files with same name will be overwritten.
        cb(null, file.originalname);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (path.extname(file.originalname) === '.zip') {
        return cb(null, true);
      }
      cb(new Error('Only ".zip" is allowed'));
    },
  });

  const uploadsForAttachment = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, importService.baseDir);
      },
      filename(req, file, cb) {
        // to prevent hashing the file name. files with same name will be overwritten.
        cb(null, file.originalname);
      },
    }),
  });

  const isInstalled = crowi.configManager?.getConfig('crowi', 'app:installed');

  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  // Middleware
  const adminRequiredIfInstalled = (req: Request, res: ApiV3Response, next: NextFunction) => {
    if (!isInstalled) {
      next();
      return;
    }

    return adminRequired(req, res, next);
  };

  // Middleware
  const appSiteUrlRequiredIfNotInstalled = (req: Request, res: ApiV3Response, next: NextFunction) => {
    if (!isInstalled && req.body.appSiteUrl != null) {
      next();
      return;
    }

    if (crowi.configManager?.getConfig('crowi', 'app:siteUrl') != null || req.body.appSiteUrl != null) {
      next();
      return;
    }

    return res.apiv3Err(new ErrorV3('Body param "appSiteUrl" is required when GROWI is NOT installed yet'), 400);
  };

  // Local middleware to check if key is valid or not
  const validateTransferKey = async(req: Request, res: ApiV3Response, next: NextFunction) => {
    const transferKey = req.headers[X_GROWI_TRANSFER_KEY_HEADER_NAME] as string;

    try {
      await g2gTransferReceiverService.validateTransferKey(transferKey);
    }
    catch (err) {
      return res.apiv3Err(new ErrorV3('Invalid transfer key', 'invalid_transfer_key'), 403);
    }

    next();
  };

  const router = express.Router();
  const receiveRouter = express.Router();
  const pushRouter = express.Router();

  // eslint-disable-next-line max-len
  receiveRouter.get('/files', validateTransferKey, async(req: Request, res: ApiV3Response) => {
    const files = await crowi.fileUploadService.listFiles();
    return res.apiv3({ files });
  });

  // Auto import
  // eslint-disable-next-line max-len
  receiveRouter.post('/', uploads.single('transferDataZipFile'), validateTransferKey, async(req: Request & { file: any; }, res: ApiV3Response) => {
    const { file } = req;
    const {
      collections: strCollections,
      optionsMap: strOptionsMap,
      operatorUserId,
      uploadConfigs: strUploadConfigs,
    } = req.body;

    /*
     * parse multipart form data
     */
    let collections;
    let optionsMap;
    let sourceGROWIUploadConfigs;
    try {
      collections = JSON.parse(strCollections);
      optionsMap = JSON.parse(strOptionsMap);
      sourceGROWIUploadConfigs = JSON.parse(strUploadConfigs);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Failed to parse request body.', 'parse_failed'), 500);
    }

    /*
     * unzip and parse
     */
    let meta;
    let innerFileStats;
    try {
      const zipFile = importService.getFile(file.filename);
      await importService.unzip(zipFile);

      const { meta: parsedMeta, innerFileStats: _innerFileStats } = await growiBridgeService.parseZipFile(zipFile);
      innerFileStats = _innerFileStats;
      meta = parsedMeta;
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Failed to validate transfer data file.', 'validation_failed'), 500);
    }

    /*
     * validate meta.json
     */
    try {
      importService.validate(meta);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(
        new ErrorV3(
          'The version of this GROWI and the uploaded GROWI data are not the same',
          'version_incompatible',
        ),
        500,
      );
    }

    /*
     * generate maps of ImportSettings to import
     */
    let importSettingsMap;
    try {
      importSettingsMap = g2gTransferReceiverService.getImportSettingMap(innerFileStats, optionsMap, operatorUserId);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Import settings are invalid. See GROWI docs about details.', 'import_settings_invalid'));
    }

    try {
      await g2gTransferReceiverService.importCollections(collections, importSettingsMap, sourceGROWIUploadConfigs);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Failed to import MongoDB collections', 'mongo_collection_import_failure'), 500);
    }

    return res.apiv3({ message: 'Successfully started to receive transfer data.' });
  });

  // This endpoint uses multer's MemoryStorage since the received data should be persisted directly on attachment storage.
  receiveRouter.post('/attachment', uploadsForAttachment.single('content'), validateTransferKey,
    async(req: Request & { file: any; }, res: ApiV3Response) => {
      const { file } = req;
      const { attachmentMetadata } = req.body;

      let attachmentMap;
      try {
        attachmentMap = JSON.parse(attachmentMetadata);
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Failed to parse body.', 'parse_failed'), 500);
      }

      const fileStream = createReadStream(file.path, {
        flags: 'r', mode: 0o666, autoClose: true,
      });
      try {
        await g2gTransferReceiverService.receiveAttachment(fileStream, attachmentMap);
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Failed to upload.', 'upload_failed'), 500);
      }

      return res.apiv3({ message: 'Successfully imported attached file.' });
    });

  receiveRouter.get('/growi-info', validateTransferKey, async(req: Request, res: ApiV3Response) => {
    let growiInfo: IDataGROWIInfo;
    try {
      growiInfo = await g2gTransferReceiverService.answerGROWIInfo();
    }
    catch (err) {
      logger.error(err);

      if (!isG2GTransferError(err)) {
        return res.apiv3Err(new ErrorV3('Failed to prepare GROWI info', 'failed_to_prepare_growi_info'), 500);
      }

      return res.apiv3Err(new ErrorV3(err.message, err.code), 500);
    }

    return res.apiv3({ growiInfo });
  });

  // eslint-disable-next-line max-len
  receiveRouter.post('/generate-key', accessTokenParser, adminRequiredIfInstalled, appSiteUrlRequiredIfNotInstalled, async(req: Request, res: ApiV3Response) => {
    const appSiteUrl = req.body.appSiteUrl ?? crowi.configManager?.getConfig('crowi', 'app:siteUrl');

    let appSiteUrlOrigin: string;
    try {
      appSiteUrlOrigin = new URL(appSiteUrl).origin;
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('appSiteUrl may be wrong', 'failed_to_generate_key_string'));
    }

    // Save TransferKey document
    let transferKeyString: string;
    try {
      transferKeyString = await g2gTransferReceiverService.createTransferKey(appSiteUrlOrigin);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Error occurred while generating transfer key.', 'failed_to_generate_key'));
    }

    return res.apiv3({ transferKey: transferKeyString });
  });

  // eslint-disable-next-line max-len
  pushRouter.post('/transfer', accessTokenParser, loginRequiredStrictly, adminRequired, validator.transfer, apiV3FormValidator, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const { transferKey, collections, optionsMap } = req.body;

    // Parse transfer key
    let tk: TransferKey;
    try {
      tk = TransferKey.parse(transferKey);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Transfer key is invalid', 'transfer_key_invalid'), 400);
    }

    // get growi info
    let destGROWIInfo: IDataGROWIInfo;
    try {
      destGROWIInfo = await g2gTransferPusherService.askGROWIInfo(tk);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Error occurred while asking GROWI info.', 'failed_to_ask_growi_info'));
    }

    // Check if can transfer
    const transferability = await g2gTransferPusherService.getTransferability(destGROWIInfo);
    if (!transferability.canTransfer) {
      return res.apiv3Err(new ErrorV3(transferability.reason, 'growi_incompatible_to_transfer'));
    }

    // Start transfer
    // DO NOT "await". Let it run in the background.
    // Errors should be emitted through websocket.
    g2gTransferPusherService.startTransfer(tk, req.user, collections, optionsMap, destGROWIInfo);

    return res.apiv3({ message: 'Successfully requested auto transfer.' });
  });

  // Merge receiveRouter and pushRouter
  router.use(receiveRouter, pushRouter);

  return router;
};
