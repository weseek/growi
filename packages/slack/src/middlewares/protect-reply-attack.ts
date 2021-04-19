import { createHmac, timingSafeEqual } from 'crypto';
import { stringify } from 'qs';

export const protectReplyAttack = (req, res, next):Record<string, any>| void => {
  // protect against replay attacks
  // take out slackSignature and timestamp from header
  const slackSignature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
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
};
