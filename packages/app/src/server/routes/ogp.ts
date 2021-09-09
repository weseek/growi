import {
  Request, Response,
} from 'express';

import axios from 'src/utils/axios';

export const renderOgp = async(req: Request, res: Response): Promise<Response> => {

  if (req.params.pageId === '') {
    return res.status(400).send();
  }

  const ogpUri: string = process.env.OGP_URI || '';
  if (ogpUri === '') {
    return res.status(400).send('OGP URI for GROWI has not been setup');
  }

  const result = await axios({
    url: ogpUri,
    method: 'GET',
    responseType: 'stream',
    params: {
      title: '20210803_ OpenWikiのOGPを表示できるようにする',
      brand: 'GROWI Developers Wiki',
    },
  });

  return res.status(200).send();
};
