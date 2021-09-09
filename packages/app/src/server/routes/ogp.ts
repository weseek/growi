import {
  Request, Response,
} from 'express';

export const renderOgp = (req: Request, res: Response): Response => {
  console.log('This is the route to display the ogp image');
  console.log(req.params);

  if (req.params.pageId === '') {
    return res.status(400).send();
  }

  // TODO: GW-7369 Allow the OGP server to pipe images back to the request and response

  return res.status(200).send();
};
