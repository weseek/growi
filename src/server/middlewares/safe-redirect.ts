/**
 * Redirect with prevention from Open Redirect
 *
 */
// for Ts.ED
// import {
//   Middleware, Req, Res, Next,
// } from '@tsed/common';
import { Request, Response, NextFunction } from 'express';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middleware:safe-redirect');


interface ResponseWithSafeRedirect extends Response {
  safeRedirect(url: string): void;
}

// @Middleware()
class SafeRedirectMiddleware {

  static whitelistOfHosts: string[] = [];

  static setWhitelistOfHosts(whitelistOfHosts: string[]): void {
    SafeRedirectMiddleware.whitelistOfHosts = whitelistOfHosts;
  }

  // for Ts.ED
  // use(@Req() req: Request, @Res() res: ResponseWithSafeRedirect, @Next() next: NextFunction): void {
  use(req: Request, res: ResponseWithSafeRedirect, next: NextFunction): void {
    const { whitelistOfHosts } = SafeRedirectMiddleware;

    // extend res object
    res.safeRedirect = (redirectTo) => {
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
        const isWhitelisted = this.isInWhitelist(redirectTo);
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
  }

  /**
   * Check whether the redirect url host is in specified whitelist
   * @param whitelistOfHosts
   * @param redirectToFqdn
   */
  private isInWhitelist(redirectToFqdn): boolean {
    const { whitelistOfHosts } = SafeRedirectMiddleware;

    if (whitelistOfHosts == null || whitelistOfHosts.length === 0) {
      return false;
    }

    const redirectUrl = new URL(redirectToFqdn);
    return whitelistOfHosts.includes(redirectUrl.hostname) || whitelistOfHosts.includes(redirectUrl.host);
  }

}

const middleware = new SafeRedirectMiddleware();
export default middleware.use;
