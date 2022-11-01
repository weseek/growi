import { Request, Response } from 'express';

import { IUserRegistrationOrder } from '~/server/models/user-registration-order';

type Crowi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextApp: any,
}

type CrowiReq = Request & {
  crowi: Crowi,
  userRegistrationOrder: IUserRegistrationOrder
}

export const renderUserActivationPage = (crowi: Crowi) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (req: CrowiReq, res: Response): void => {
    const { userRegistrationOrder } = req;
    const { nextApp } = crowi;
    req.crowi = crowi;
    nextApp.render(req, res, '/user-activation', { userRegistrationOrder });
    return;
  };
};

// middleware to handle error
export const tokenErrorHandlerMiddeware = (err, req, res, next) => {
  if (err != null) {
    req.flash('errorMessage', req.t('message.incorrect_token_or_expired_url'));
    return res.redirect('/login#register');
  }
  next();
};
