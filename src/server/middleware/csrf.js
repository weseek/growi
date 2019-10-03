const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:csrf');

module.exports = (crowi) => {

  return async(req, res, next) => {
    const token = req.body._csrf || req.query._csrf || null;
    const csrfKey = (req.session && req.session.id) || 'anon';

    logger.debug('req.skipCsrfVerify', req.skipCsrfVerify);

    if (req.skipCsrfVerify) {
      logger.debug('csrf verify skipped');
      return next();
    }

    if (crowi.getTokens().verify(csrfKey, token)) {
      logger.debug('csrf successfully verified');
      return next();
    }

    logger.warn('csrf verification failed. return 403', csrfKey, token);
    return res.sendStatus(403);
  };

};
