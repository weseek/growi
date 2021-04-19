import { Request, Response, NextFunction } from 'express';
import { protectReplyAttack } from '../middlewares/protect-reply-attack';
/**
   * Verify if the request came from slack
   * See: https://api.slack.com/authentication/verifying-requests-from-slack
   */

type signingSecretType = {
  signingSecret?:string; headers:{'x-slack-signature'?:string, 'x-slack-request-timestamp':number}
}

// eslint-disable-next-line max-len
export const verifyingIsSlackRequest = (req : Request & signingSecretType, res:Response, next:NextFunction):Record<string, any>| void => {
  if (req.signingSecret == null) {
    return res.send('No signing secret.');
  }
  protectReplyAttack(req, res, next);

  return res.send('Verification failed');
};
