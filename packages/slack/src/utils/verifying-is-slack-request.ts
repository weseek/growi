import crypto from 'crypto';
import qs from 'qs';

/**
   * Verify if the request came from slack
   * See: https://api.slack.com/authentication/verifying-requests-from-slack
   */
// TODO GW-5628 move this to slack package
export const verifyingIsSlackRequest = (req, res, next):string => {
  console.log("hogematus");
  // Temporary
  // req.signingSecret = crowi.configManager.getConfig('crowi', 'slackbot:signingSecret');
  req.signingSecret = 'dummy';

  // take out slackSignature and timestamp from header
  const slackSignature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];

  // protect against replay attacks
  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - timestamp) > 300) {
    return res.send('Verification failed.');
  }

  // generate growi signature
  const sigBaseString = `v0:${timestamp}:${qs.stringify(req.body, { format: 'RFC1738' })}`;
  const hasher = crypto.createHmac('sha256', req.signingSecret);
  hasher.update(sigBaseString, 'utf8');
  const hashedSigningSecret = hasher.digest('hex');
  const growiSignature = `v0=${hashedSigningSecret}`;

  // compare growiSignature and slackSignature
  if (crypto.timingSafeEqual(Buffer.from(growiSignature, 'utf8'), Buffer.from(slackSignature, 'utf8'))) {
    return next();
  }
console.log("ippo");

  return res.send('Verification failed');
};

// export const verifyingIsSlackRequest = (req, res, next) => {
// return 'hoge'
// }
