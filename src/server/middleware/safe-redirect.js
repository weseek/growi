/**
 * Redirect with prevention from Open Redirect
 *
 * Usage: app.use(require('middleware/safe-redirect')(['example.com', 'some.example.com:8080']))
 */

const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:middleware:safe-redirect');

/**
 * Check whether the redirect url host is in specified whitelist
 * @param {Array<string>} whitelistOfHosts
 * @param {string} redirectToFqdn
 */
function isInWhitelist(whitelistOfHosts, redirectToFqdn) {
  if (whitelistOfHosts == null || whitelistOfHosts.length === 0) {
    return false;
  }

  const redirectUrl = new URL(redirectToFqdn);
  return whitelistOfHosts.includes(redirectUrl.hostname) || whitelistOfHosts.includes(redirectUrl.host);
}


module.exports = (whitelistOfHosts) => {

  return function(req, res, next) {

    // extend res object
    res.safeRedirect = function(redirectTo) {
      if (redirectTo == null) {
        return res.redirect('/');
      }

      try {
        // check inner redirect
        const redirectUrl = new URL(redirectTo, `${req.protocol}://${req.get('host')}`);
        if (redirectUrl.hostname === req.hostname) {
          logger.debug(`Requested redirect URL (${redirectTo}) is local.`);
          return res.redirect(redirectUrl.href);
        }
        logger.debug(`Requested redirect URL (${redirectTo}) is NOT local.`);

        // check whitelisted redirect
        const isWhitelisted = isInWhitelist(whitelistOfHosts, redirectTo);
        if (isWhitelisted) {
          logger.debug(`Requested redirect URL (${redirectTo}) is in whitelist.`, `whitelist=${whitelistOfHosts}`);
          return res.redirect(redirectTo);
        }
        logger.debug(`Requested redirect URL (${redirectTo}) is NOT in whitelist.`, `whitelist=${whitelistOfHosts}`);
      }
      catch (err) {
        logger.warn(`Requested redirect URL (${redirectTo}) is invalid.`, err);
      }

      logger.warn(`Requested redirect URL (${redirectTo}) is UNSAFE, redirecting to root page.`);
      return res.redirect('/');
    };

    next();

  };

};
