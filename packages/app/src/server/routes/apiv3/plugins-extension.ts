import express, { Request } from 'express';

import Crowi from '../../crowi';

import { ApiV3Response } from './interfaces/apiv3-response';

type PluginInstallerFormRequest = Request & { form: any };

module.exports = (crowi: Crowi) => {
  const router = express.Router();
  const { pluginService } = crowi;

  router.post('/', async(req: PluginInstallerFormRequest, res: ApiV3Response) => {
    if (pluginService == null) {
      return res.apiv3Err(400);
    }

    try {
      await pluginService.install(req.body.pluginInstallerForm);
      return res.apiv3({});
    }
    catch (err) {
      return res.apiv3Err(err, 400);
    }
  });

  return router;
};
