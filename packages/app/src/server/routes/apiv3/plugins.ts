import express, { Request, Router } from 'express';
import { body, query } from 'express-validator';
import mongoose from 'mongoose';

import Crowi from '../../crowi';
import type { GrowiPluginModel } from '../../models/growi-plugin';

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
      throw new Error('\'pluginService\' is not import.');
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
      throw new Error('\'pluginService\' is not import.');
    }

    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const GrowiPluginModel = mongoose.model('GrowiPlugin') as GrowiPluginModel;
      const data = await GrowiPluginModel.getPlugin(pluginId);
      return res.apiv3({ plugin: data });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/', loginRequiredStrictly, adminRequired, validator.pluginFormValueisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      throw new Error('\'pluginService\' is not import.');
    }

    const { pluginInstallerForm: formValue } = req.body;

    try {
      await pluginService.install(formValue);
      return res.apiv3();
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.put('/:id/activate', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      throw new Error('\'pluginService\' is not import.');
    }

    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const GrowiPluginModel = mongoose.model('GrowiPlugin') as GrowiPluginModel;
      const data = await GrowiPluginModel.activateStatus(pluginId);
      return res.apiv3({ isEnabled: data?.isEnabled });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.put('/:id/deactivate', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      throw new Error('\'pluginService\' is not import.');
    }

    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const GrowiPluginModel = mongoose.model('GrowiPlugin') as GrowiPluginModel;
      const data = await GrowiPluginModel.deactivateStatus(pluginId);
      return res.apiv3({ isEnabled: data?.isEnabled });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.delete('/:id/remove', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      throw new Error('\'pluginService\' is not import.');
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
