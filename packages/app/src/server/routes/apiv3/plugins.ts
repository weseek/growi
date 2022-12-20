import express, { Request, Router } from 'express';
import { body, query } from 'express-validator';
import mongoose from 'mongoose';

import Crowi from '../../crowi';

import { ApiV3Response } from './interfaces/apiv3-response';

const ObjectID = mongoose.Types.ObjectId;

/*
 * Validators
 */
const validator = {
  pluginIdisRequired: [
    query('id').isMongoId().withMessage('pluginId is required'),
  ],
  pluginFormValueisRequired: [
    body('pluginInstallerForm').isString().withMessage('pluginFormValue is required'),
  ],
};

module.exports = (crowi: Crowi): Router => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);

  const router = express.Router();
  const { pluginService } = crowi;

  router.get('/', loginRequiredStrictly, adminRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    try {
      const data = await pluginService.getPlugins();
      return res.apiv3({ plugins: data });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.get('/:id', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const data = await pluginService.getPlugin(pluginId);
      return res.apiv3({ plugin: data });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/', loginRequiredStrictly, adminRequired, validator.pluginFormValueisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    const { pluginInstallerForm: formValue } = req.body;

    try {
      await pluginService.install(formValue);
      return res.apiv3({});
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.put('/:id/activate', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const pluginIsEnabled = await pluginService.switchPluginIsEnabled(pluginId);
      return res.apiv3({ isEnabled: pluginIsEnabled });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.put('/:id/deactivate', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {

    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const pluginIsEnabled = await pluginService.switchPluginIsEnabled(pluginId);
      return res.apiv3({ isEnabled: pluginIsEnabled });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.delete('/:id/remove', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      await pluginService.deletePlugin(pluginId);
      return res.apiv3();
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  return router;
};
