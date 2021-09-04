import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middleware:admin-required');

module.exports = (crowi, fallback = null) => {

  // TODO: remove comment
  // remove async, reflected from login-required.js, it doesn't use async
  return function(req, res, next) {

    // TODO: Remove debug log
    logger.warn('grune admin-required ran');
    if (req.user != null) {
      logger.warn('grune req.user 1');
    }
    else {
      logger.warn('grune req.user 0');
    }

    if (req.user != null && (req.user instanceof Object) && '_id' in req.user) {
      if (req.user.admin) {
        return next();
      }

      logger.warn('This user is not admin.');

      if (fallback != null) {
        return fallback(req, res, next);
      }
      return res.redirect('/');
    }

    logger.warn('This user has not logged in.');

    if (fallback != null) {
      return fallback(req, res, next);
    }
    return res.redirect('/login');
  };

};
