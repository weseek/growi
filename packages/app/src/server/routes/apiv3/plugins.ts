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
      return res.apiv3Err('\'pluginService\' is not set up', 500);
    }

    try {
      const GrowiPluginModel = mongoose.model('GrowiPlugin') as GrowiPluginModel;
      const data = await GrowiPluginModel.find({});
      return res.apiv3({ plugins: data });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/', loginRequiredStrictly, adminRequired, validator.pluginFormValueisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err('\'pluginService\' is not set up', 500);
    }

    const { pluginInstallerForm: formValue } = req.body;

    try {
      const pluginName = await pluginService.install(formValue);
      return res.apiv3({ pluginName });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.put('/:id/activate', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err('\'pluginService\' is not set up', 500);
    }
    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const GrowiPluginModel = mongoose.model('GrowiPlugin') as GrowiPluginModel;
      const pluginName = await GrowiPluginModel.activatePlugin(pluginId);
      return res.apiv3({ pluginName });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.put('/:id/deactivate', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err('\'pluginService\' is not set up', 500);
    }

    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const GrowiPluginModel = mongoose.model('GrowiPlugin') as GrowiPluginModel;
      const pluginName = await GrowiPluginModel.deactivatePlugin(pluginId);
      return res.apiv3({ pluginName });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.delete('/:id/remove', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err('\'pluginService\' is not set up', 500);
    }

    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const pluginName = await pluginService.deletePlugin(pluginId);
      return res.apiv3({ pluginName });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  return router;
};
