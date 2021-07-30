import loggerFactory from '~/utils/logger';

const { serializeUserSecurely } = require('../models/serializers/user-serializer');

const logger = loggerFactory('growi:middleware:access-token-parser');

module.exports = (crowi) => {

  return async(req, res, next) => {
    // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
    const accessToken = req.query.access_token || req.body.access_token || null;
    if (accessToken == null || typeof accessToken !== 'string') {
      return next();
    }

    const User = crowi.model('User');

    logger.debug('accessToken is', accessToken);

    const user = await User.findUserByApiToken(accessToken);

    if (user == null) {
      logger.debug('The access token is invalid');
      return next();
    }

    // transforming attributes
    req.user = serializeUserSecurely(user);
    req.skipCsrfVerify = true;

    logger.debug('Access token parsed: skipCsrfVerify');

    return next();
  };

};
