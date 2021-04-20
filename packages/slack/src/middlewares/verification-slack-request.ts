import { createHmac, timingSafeEqual } from 'crypto';
import { stringify } from 'qs';
import { Request, Response, NextFunction } from 'express';
/**
   * Verify if the request came from slack
   * See: https://api.slack.com/authentication/verifying-requests-from-slack
   */

type signingSecretType = {
  signingSecret?:string; headers:{'x-slack-signature'?:string, 'x-slack-request-timestamp':number}
}

// eslint-disable-next-line max-len
export const verificationSlackRequest = (req : Request & signingSecretType, res:Response, next:NextFunction):Record<string, any>| void => {
  if (req.signingSecret == null) {
    return res.send('No signing secret.');
  }

  // take out slackSignature and timestamp from header
  const slackSignature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];

  if (slackSignature == null || timestamp == null) {
    throw new Error('Verification failed.');
  }

  // protect against replay attacks
  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - timestamp) > 300) {
    return res.send('Verification failed.');
  }

  // generate growi signature
  const sigBaseString = `v0:${timestamp}:${stringify(req.body, { format: 'RFC1738' })}`;
  const hasher = createHmac('sha256', req.signingSecret);
  hasher.update(sigBaseString, 'utf8');
  const hashedSigningSecret = hasher.digest('hex');
  const growiSignature = `v0=${hashedSigningSecret}`;

  // compare growiSignature and slackSignature
  if (timingSafeEqual(Buffer.from(growiSignature, 'utf8'), Buffer.from(slackSignature, 'utf8'))) {
    return next();

  }

  return res.send('Verification failed.');
};
