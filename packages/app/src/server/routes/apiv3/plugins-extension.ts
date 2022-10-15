import express, { Request } from 'express';

import Crowi from '../../crowi';

import { ApiV3Response } from './interfaces/apiv3-response';

type PluginInstallerFormRequest = Request & { form: any };

module.exports = (crowi: Crowi) => {
  const router = express.Router();
  const { pluginService } = crowi;

  router.get('/', async(req: any, res: any) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    try {
      const data = await pluginService.getPlugins();
      return res.apiv3({ plugins: data });
    }
    catch (err) {
      return res.apiv3Err(err, 400);
    }
  });

  router.post('/', async(req: PluginInstallerFormRequest, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    try {
      await pluginService.install(crowi, req.body.pluginInstallerForm);
      return res.apiv3({});
    }
    catch (err) {
      return res.apiv3Err(err, 400);
    }
  });

  router.post('/swrplugin', async(req: PluginInstallerFormRequest, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    console.log('id2', req.body._id);
    try {
      const pluginIsEnabled = await pluginService.switchPluginIsEnabled(req.body._id);
      console.log('get', pluginIsEnabled);
      return res.apiv3({ isEnabled: pluginIsEnabled });
    }
    catch (err) {
      return res.apiv3Err(err, 400);
    }
  });

  router.post('/plugin', async(req: PluginInstallerFormRequest, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    console.log('id2', req.body._id);
    try {
      const pluginIsEnabled = await pluginService.switchPluginIsEnabled2(req.body._id);
      console.log('post', pluginIsEnabled);
      return res.apiv3({ isEnabled: pluginIsEnabled });
    }
    catch (err) {
      return res.apiv3Err(err, 400);
    }
  });

  return router;
};
