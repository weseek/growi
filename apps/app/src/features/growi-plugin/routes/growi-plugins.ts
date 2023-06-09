import express, { Request, Router } from 'express';
import { body, query } from 'express-validator';
import mongoose from 'mongoose';

import Crowi from '~/server/crowi';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';

import { GrowiPlugin } from '../models';
import { growiPluginService } from '../services';


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
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);
  const adminRequired = require('~/server/middlewares/admin-required')(crowi);

  const router = express.Router();

  router.get('/', loginRequiredStrictly, adminRequired, async(req: Request, res: ApiV3Response) => {
    try {
      const data = await GrowiPlugin.find({});
      return res.apiv3({ plugins: data });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/', loginRequiredStrictly, adminRequired, validator.pluginFormValueisRequired, async(req: Request, res: ApiV3Response) => {
    const { pluginInstallerForm: formValue } = req.body;

    try {
      const pluginName = await growiPluginService.install(formValue);
      return res.apiv3({ pluginName });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.put('/:id/activate', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const pluginName = await GrowiPlugin.activatePlugin(pluginId);
      return res.apiv3({ pluginName });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.put('/:id/deactivate', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const pluginName = await GrowiPlugin.deactivatePlugin(pluginId);
      return res.apiv3({ pluginName });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.delete('/:id/remove', loginRequiredStrictly, adminRequired, validator.pluginIdisRequired, async(req: Request, res: ApiV3Response) => {
    const { id } = req.params;
    const pluginId = new ObjectID(id);

    try {
      const pluginName = await growiPluginService.deletePlugin(pluginId);
      return res.apiv3({ pluginName });
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  return router;
};
