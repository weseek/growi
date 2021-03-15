import loggerFactory from '~/utils/logger';
import User from '~/server/models/user';

const { serializeUserSecurely } = require('../models/serializers/user-serializer');

const logger = loggerFactory('growi:middleware:access-token-parser');

module.exports = (crowi) => {

  return async(req, res, next) => {
    // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
    const accessToken = req.query.access_token || req.body.access_token || null;
    if (!accessToken) {
      return next();
    }

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
