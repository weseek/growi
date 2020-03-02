const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:safe-redirect');

/**
 * Redirect with prevention from Open Redirect
 *
 * Usage: app.use(require('middleware/safe-redirect'))
 */
module.exports = function(req, res, next) {

  // extends res object
  res.safeRedirect = function(redirectTo) {
    if (redirectTo == null) {
      return res.redirect('/');
    }

    // prevention from open redirect
    try {
      const redirectUrl = new URL(redirectTo, `${req.protocol}://${req.get('host')}`);
      if (redirectUrl.hostname === req.hostname) {
        return res.redirect(redirectUrl);
      }
      logger.warn('Requested redirect URL is invalid, redirect to root page');
    }
    catch (err) {
      logger.warn('Requested redirect URL is invalid, redirect to root page', err);
    }

    return res.redirect('/');
  };

  next();

};
