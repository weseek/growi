import path from 'path';
import { Readable } from 'stream';

import express, { NextFunction, Request, Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';

import { SupportedAction } from '~/interfaces/activity';
import GrowiArchiveImportOption from '~/models/admin/growi-archive-import-option';
import TransferKeyModel from '~/server/models/transfer-key';
import { isG2GTransferError } from '~/server/models/vo/g2g-transfer-error';
import { IDataGROWIInfo, X_GROWI_TRANSFER_KEY_HEADER_NAME } from '~/server/service/g2g-transfer';
import loggerFactory from '~/utils/logger';
import { TransferKey } from '~/utils/vo/transfer-key';


import Crowi from '../../crowi';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';
import ErrorV3 from '../../models/vo/error-apiv3';

import { generateOverwriteParams } from './import';
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
    growiBridgeService,
  } = crowi;
  if (g2gTransferPusherService == null || g2gTransferReceiverService == null || exportService == null || importService == null
    || growiBridgeService == null) {
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
    storage: multer.memoryStorage(),
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
  const verifyAndExtractTransferKey = async(req: Request & { transferKey: TransferKey }, res: ApiV3Response, next: NextFunction) => {
    const key = req.headers[X_GROWI_TRANSFER_KEY_HEADER_NAME];

    if (typeof key !== 'string') {
      return res.apiv3Err(new ErrorV3('Invalid transfer key or not set.', 'invalid_transfer_key'), 400);
    }

    let transferKey;
    try {
      transferKey = await (TransferKeyModel as any).findOneActiveTransferKey(key); // TODO: Improve TS of models
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Error occurred while trying to fing a transfer key.', 'failed_to_find_transfer_key'), 500);
    }

    if (transferKey == null) {
      return res.apiv3Err(new ErrorV3('Transfer key has expired or not found.', 'transfer_key_expired_or_not_found'), 404);
    }

    // Inject transferKey to req
    try {
      req.transferKey = TransferKey.parse(transferKey.keyString);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Transfer key is invalid.', 'invalid_transfer_key'), 500);
    }

    next();
  };

  const router = express.Router();
  const receiveRouter = express.Router();
  const pushRouter = express.Router();

  // Auto import
  // eslint-disable-next-line max-len
  receiveRouter.post('/', uploads.single('transferDataZipFile'), verifyAndExtractTransferKey, async(req: Request & { transferKey: TransferKey, operatorUserId: string }, res: ApiV3Response) => {
    const { file } = req;

    const zipFile = importService.getFile(file.filename);

    const { collections: strCollections, optionsMap: strOptionsMap, operatorUserId } = req.body;

    // Parse multipart form data
    let collections;
    let optionsMap;
    try {
      collections = JSON.parse(strCollections);
      optionsMap = JSON.parse(strOptionsMap);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Failed to parse body.', 'parse_failed'), 500);
    }

    /*
     * unzip, parse
     */
    let meta;
    let innerFileStats;
    try {
      // unzip
      await importService.unzip(zipFile);

      // eslint-disable-next-line no-unused-vars
      const { meta: parsedMeta, innerFileStats: _innerFileStats } = await growiBridgeService.parseZipFile(zipFile);
      innerFileStats = _innerFileStats;
      meta = parsedMeta;
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Failed to validate transfer data file.', 'validation_failed'), 500);
    }

    try {
      // validate with meta.json
      importService.validate(meta);
    }
    catch (err) {
      logger.error(err);

      const msg = 'the version of this growi and the growi that exported the data are not met';
      const varidationErr = 'version_incompatible';
      return res.apiv3Err(new ErrorV3(msg, varidationErr), 500);
    }

    // generate maps of ImportSettings to import
    const importSettingsMap = {};
    try {
      innerFileStats.forEach(({ fileName, collectionName }) => {
        // instanciate GrowiArchiveImportOption
        const options = new GrowiArchiveImportOption(null, optionsMap[collectionName]);

        // generate options
        if (collectionName === 'configs' && options.mode !== 'flushAndInsert') {
          throw Error('`flushAndInsert` is only available as an import setting for configs collection');
        }
        if (collectionName === 'pages' && options.mode === 'insert') {
          throw Error('`insert` is not available as an import setting for pages collection');
        }

        const importSettings = importService.generateImportSettings(options.mode);

        importSettings.jsonFileName = fileName;

        // generate overwrite params
        importSettings.overwriteParams = generateOverwriteParams(collectionName, operatorUserId, options);

        importSettingsMap[collectionName] = importSettings;
      });
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Import settings invalid. See growi docs about details.', 'import_settings_invalid'));
    }

    /*
     * import
     */
    try {
      await importService.import(collections, importSettingsMap);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Failed to import.', 'failed_to_import'), 500);
    }

    return res.apiv3({ message: 'Successfully started to receive transfer data.' });
  });

  // TODO: verify transfer key
  // This endpoint uses multer's MemoryStorage since the received data should be persisted directly on attachment storage.
  receiveRouter.post('/attachment', uploadsForAttachment.single('content'), /* verifyAndExtractTransferKey, */
    async(req: Request & { transferKey: TransferKey }, res: ApiV3Response) => {
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

      // convert Buffer to stream
      // see: https://stackoverflow.com/a/62143160
      await g2gTransferReceiverService.receiveAttachment(Readable.from(file.buffer), attachmentMap);

      return res.apiv3({ message: 'Successfully imported attached file.' });
    });

  receiveRouter.get('/growi-info', verifyAndExtractTransferKey, async(req: Request & { transferKey: TransferKey }, res: ApiV3Response) => {
    let growiInfo: IDataGROWIInfo;
    try {
      growiInfo = await g2gTransferReceiverService.answerGROWIInfo();
    }
    catch (err) {
      logger.error(err);

      if (!isG2GTransferError(err)) {
        return res.apiv3Err(new ErrorV3('Failed to prepare growi info', 'failed_to_prepare_growi_info'), 500);
      }

      return res.apiv3Err(new ErrorV3(err.message, err.code), 500);
    }

    return res.apiv3({ growiInfo });
  });

  // eslint-disable-next-line max-len
  receiveRouter.post('/generate-key', accessTokenParser, adminRequiredIfInstalled, appSiteUrlRequiredIfNotInstalled, async(req: Request, res: ApiV3Response) => {
    const strAppSiteUrl = req.body.appSiteUrl ?? crowi.configManager?.getConfig('crowi', 'app:siteUrl');

    // Generate transfer key string
    let appSiteUrl: URL;
    try {
      appSiteUrl = new URL(strAppSiteUrl);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('appSiteUrl may be wrong', 'failed_to_generate_key_string'));
    }

    // Save TransferKey document
    let transferKeyString: string;
    try {
      transferKeyString = await g2gTransferReceiverService.createTransferKey(appSiteUrl);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Error occurred while generating transfer key.', 'failed_to_generate_key'));
    }

    return res.apiv3({ transferKey: transferKeyString });
  });

  // Auto export
  // TODO: Use socket to send progress info to the client
  // eslint-disable-next-line max-len
  pushRouter.post('/transfer', accessTokenParser, loginRequiredStrictly, adminRequired, validator.transfer, apiV3FormValidator, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const { transferKey: transferKeyString, collections, optionsMap } = req.body;

    // Parse transfer key
    let tk: TransferKey;
    try {
      tk = TransferKey.parse(transferKeyString);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Transfer key is invalid', 'transfer_key_invalid'), 400);
    }

    // Ask growi info
    // TODO: Ask progress as well
    let toGROWIInfo: IDataGROWIInfo;
    try {
      toGROWIInfo = await g2gTransferPusherService.askGROWIInfo(tk);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Error occurred while asking GROWI growi info.', 'failed_to_ask_growi_info'));
    }

    // Check if can transfer
    const canTransfer = await g2gTransferPusherService.canTransfer(toGROWIInfo);
    if (!canTransfer) {
      logger.debug('Could not transfer.');
      return res.apiv3Err(new ErrorV3('GROWI is incompatible to transfer data.', 'growi_incompatible_to_transfer'));
    }

    // Start transfer
    try {
      await g2gTransferPusherService.startTransfer(tk, req.user, toGROWIInfo, collections, optionsMap);
    }
    catch (err) {
      logger.error(err);

      if (!isG2GTransferError(err)) {
        return res.apiv3Err(new ErrorV3('Failed to transfer', 'failed_to_transfer'), 500);
      }

      return res.apiv3Err(new ErrorV3(err.message, err.code), 500);
    }

    return res.apiv3({ message: 'Successfully requested auto transfer.' });
  });

  // Merge receiveRouter and pushRouter
  router.use(receiveRouter, pushRouter);

  return router;
};
