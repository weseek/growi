const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:access-token-parser');

module.exports = (crowi) => {

  return async(req, res, next) => {
    // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
    const accessToken = req.query.access_token || req.body.access_token || null;
    if (!accessToken) {
      return next();
    }

    const User = crowi.model('User');

    logger.debug('accessToken is', accessToken);

    const user = await User.findUserByApiToken(accessToken);
    req.user = user;
    req.skipCsrfVerify = true;

    logger.debug('Access token parsed: skipCsrfVerify');

    next();
  };

};
