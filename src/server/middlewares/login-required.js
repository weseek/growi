const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:login-required');

/**
 * require login handler
 *
 * @param {boolean} isGuestAllowed whethere guest user is allowed (default false)
 * @param {function} fallback fallback function which will be triggered when the check cannot be passed
 */
module.exports = (crowi, isGuestAllowed = false, fallback = null) => {

  return function(req, res, next) {

    // check the route config and ACL
    if (isGuestAllowed && crowi.aclService.isGuestAllowedToRead()) {
      logger.debug('Allowed to read: ', req.path);
      return next();
    }

    // check the page is shared
    if (isGuestAllowed && req.isSharedPage) {
      logger.debug('Target page is shared page');
      return next();
    }

    const User = crowi.model('User');

    // check the user logged in
    if (req.user != null && (req.user instanceof Object) && '_id' in req.user) {
      if (req.user.status === User.STATUS_ACTIVE) {
        // Active の人だけ先に進める
        return next();
      }
      if (req.user.status === User.STATUS_REGISTERED) {
        return res.redirect('/login/error/registered');
      }
      if (req.user.status === User.STATUS_SUSPENDED) {
        return res.redirect('/login/error/suspended');
      }
      if (req.user.status === User.STATUS_INVITED) {
        return res.redirect('/login/invited');
      }
    }

    // is api path
    const path = req.path || '';
    if (path.match(/^\/_api\/.+$/)) {
      if (fallback != null) {
        return fallback(req, res);
      }
      return res.sendStatus(403);
    }

    if (fallback != null) {
      return fallback(req, res);
    }
    req.session.redirectTo = req.originalUrl;
    return res.redirect('/login');
  };

};
