import {
  Request, Response,
} from 'express';

import axios from '~/utils/axios';

module.exports = function(crowi) {

  const ogpUri = crowi.configManager.getConfig('crowi', 'app:ogpUri');
  if (ogpUri == null) {
    return {
      renderOgp: (req: Request, res: Response) => {
        return res.status(400).send('OGP URI for GROWI has not been setup');
      },
    };
  }

  const wikiMode = 'public';
  // const wikiMode = crowi.configManager.getConfig('crowi', 'security:wikiMode');
  const restrictGuestMode = crowi.configManager.getConfig('crowi', 'security:restrictGuestMode');
  if (wikiMode !== 'public' || restrictGuestMode !== 'Readonly') {
    return {
      renderOgp: (req: Request, res: Response) => {
        return res.status(400).send('This GROWI is not public');
      },
    };
  }

  return {
    async renderOgp(req: Request, res: Response) {

      const pageId = req.params.pageId;
      if (pageId === '') {
        return res.status(400).send('page id is not included in the parameter');
      }

      let pagePath;
      try {
        const Page = crowi.model('Page');
        const page = await Page.findByIdAndViewer(pageId, req.user);
        if (page.status !== 'published' || page.grant !== 1) {
          return res.status(400).send('the page does not exist');
        }
        pagePath = page.path;
      }
      catch (err) {
        return res.status(400).send('the page does not exist');
      }

      const appTitle = crowi.configManager.getConfig('crowi', 'app:title') || 'GROWI';

      let result;
      try {
        result = await axios({
          url: ogpUri,
          method: 'GET',
          responseType: 'stream',
          params: {
            title: pagePath,
            brand: appTitle,
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
