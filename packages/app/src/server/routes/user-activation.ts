import { Request, Response, NextFunction } from 'express';

import { ReqWithUserRegistrationOrder } from '~/server/middlewares/inject-user-registration-order-by-token-middleware';

type Crowi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextApp: any,
}

type CrowiReq = ReqWithUserRegistrationOrder & {
  crowi: Crowi,
}

export const renderUserActivationPage = (crowi: Crowi) => {
  return (req: CrowiReq, res: Response): void => {
    const { userRegistrationOrder } = req;
    const { nextApp } = crowi;
    req.crowi = crowi;
    nextApp.render(req, res, '/user-activation', { userRegistrationOrder });
    return;
  };
};

// middleware to handle error
export const tokenErrorHandlerMiddeware = (err, req: Request, res: Response, next: NextFunction) => {
  if (err != null) {
    // req.flash('errorMessage', req.t('message.incorrect_token_or_expired_url'));
    return res.redirect('/login#register');
  }
  next();
};
