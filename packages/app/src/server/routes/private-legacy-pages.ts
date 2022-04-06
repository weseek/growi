import {
  Request, Response,
} from 'express';

export const renderPrivateLegacyPages = (req: Request, res: Response): void => {
  return res.render('private-legacy-pages');
};
