const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:admin-required');

module.exports = (crowi, fallback = null) => {

  return async(req, res, next) => {
    if (req.user != null && (req.user instanceof Object) && '_id' in req.user) {
      if (req.user.admin) {
        next();
        return;
      }

      logger.warn('This user is not admin.');

      if (fallback != null) {
        return fallback(req, res);
      }
      return res.redirect('/');
    }

    logger.warn('This user has not logged in.');

    if (fallback != null) {
      return fallback(req, res);
    }
    return res.redirect('/login');
  };

};
