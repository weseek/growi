import {
  Request, Response, NextFunction,
} from 'express';

import axios from '~/utils/axios';

module.exports = function(crowi, app) {

  const ogpUri = crowi.configManager.getConfig('crowi', 'app:ogpUri');

  const isOgpUriValid = (req: Request, res: Response, next: NextFunction) => {
    if (ogpUri == null) {
      return res.status(400).send('OGP URI for GROWI has not been setup');
    }
    next();
  };

  app.use(isOgpUriValid);

  return {
    async renderOgp(req: Request, res: Response) {

      if (req.params.pageId === '') {
        return res.status(400).send();
      }

      let result;
      try {
        result = await axios({
          url: ogpUri,
          method: 'GET',
          responseType: 'stream',
          // TODO: Make it possible to display the GROWI APP name and page title
          params: {
            title: 'Page Title',
            brand: 'GROWI App Name',
          },
        });
      }
      catch (err) {
        const { status, statusText } = err.response;
        console.log(`Error! HTTP Status: ${status} ${statusText}`);
        return res.status(500).send();
      }

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
      });
      result.data.pipe(res);
    },
  };
};
