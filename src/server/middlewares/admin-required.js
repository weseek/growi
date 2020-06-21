const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:admin-required');

module.exports = (crowi) => {

  return async(req, res, next) => {
    if (req.user != null && (req.user instanceof Object) && '_id' in req.user) {
      if (req.user.admin) {
        next();
        return;
      }

      logger.warn('This user is not admin.');

      return res.redirect('/');
    }

    logger.warn('This user has not logged in.');

    return res.redirect('/login');
  };

};
