import {
  Request, Response,
} from 'express';

export const list = (req: Request, res: Response): void => {

  return res.render('me/all-in-app-notifications');
};
