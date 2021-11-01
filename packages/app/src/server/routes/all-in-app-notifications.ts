import {
  Request, Response,
} from 'express';

export const list = (req: Request, res: Response): void => {
  console.log('hogehoge');

  return res.render('me/all-in-app-notifications');
};
