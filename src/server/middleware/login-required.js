const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:login-required');

/**
 * require login handler
 *
 * @param {boolean} isGuestAllowed whethere guest user is allowed (default false)
 */
module.exports = (crowi, isGuestAllowed = false) => {

  return function(req, res, next) {

    // check the route config and ACL
    if (isGuestAllowed && crowi.aclService.isGuestAllowedToRead()) {
      logger.debug('Allowed to read: ', req.path);
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
      return res.sendStatus(403);
    }

    req.session.jumpTo = req.originalUrl;
    return res.redirect('/login');
  };

};
