import path from 'path';
import swig from 'swig-templates';
import onHeaders from 'on-headers';

import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';

const logger = loggerFactory('growi:crowi:dev');

const { listLocaleIds } = require('~/utils/locale-utils');

class CrowiDev {

  /**
   * Creates an instance of CrowiDev.
   * @param {Crowi} crowi
   *
   * @memberOf CrowiDev
   */
  constructor(crowi) {
    this.crowi = crowi;
  }

  init() {
    // this.requireForAutoReloadServer();
    // this.initSwig();
  }

  // initSwig() {
  //   swig.setDefaults({ cache: false });
  // }

  // /**
  //  * require files for node-dev auto reloading
  //  */
  // requireForAutoReloadServer() {
  //   // load all json files for live reloading
  //   listLocaleIds()
  //     .forEach((localeId) => {
  //       require(path.join(this.crowi.localeDir, localeId, 'translation.json'));
  //     });
  // }

  /**
   *
   * @param {any} app express
   */
  setupServer(app) {
    const port = this.crowi.port;
    let server = app;

    // for log
    let serverUrl = `http://localhost:${port}}`;

    if (this.crowi.env.DEV_HTTPS) {
      logger.info(`[${this.crowi.node_env}] Express server will start with HTTPS Self-Signed Certification`);

      serverUrl = `https://localhost:${port}}`;

      const fs = require('graceful-fs');
      const https = require('https');

      const options = {
        key: fs.readFileSync(resolveFromRoot('resource/certs/localhost/key.pem')),
        cert: fs.readFileSync(resolveFromRoot('resource/certs/localhost/cert.pem')),
      };

      server = https.createServer(options, app);
    }

    const eazyLogger = require('eazy-logger').Logger({
      prefix: '[{green:GROWI}] ',
      useLevelPrefixes: false,
    });

    eazyLogger.info('{bold:Server URLs:}');
    eazyLogger.unprefixed('info', '{grey:=======================================}');
    eazyLogger.unprefixed('info', `         APP: {magenta:${serverUrl}}`);
    eazyLogger.unprefixed('info', '{grey:=======================================}');

    return server;
  }

  /**
   *
   * @param {any} app express
   */
  setupExpressAfterListening(app) {
    this.setupHeaderDebugger(app);
    // this.setupBrowserSync(app);
  }

  setupHeaderDebugger(app) {
    logger.debug('setupHeaderDebugger');

    app.use((req, res, next) => {
      onHeaders(res, () => {
        logger.debug('HEADERS GOING TO BE WRITTEN');
      });
      next();
    });
  }

  // setupBrowserSync(app) {
  //   logger.debug('setupBrowserSync');

  //   const browserSync = require('browser-sync');
  //   const bs = browserSync.create().init({
  //     logSnippet: false,
  //     notify: false,
  //     files: [
  //       `${this.crowi.viewsDir}/**/*.html`,
  //       `${this.crowi.publicDir}/**/*.js`,
  //       `${this.crowi.publicDir}/**/*.css`,
  //     ],
  //   });
  //   app.use(require('connect-browser-sync')(bs));
  // }

}

module.exports = CrowiDev;
