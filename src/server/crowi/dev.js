const logger = require('@alias/logger')('growi:crowi:dev');
const fs = require('fs');
const path = require('path');

const swig = require('swig-templates');
const onHeaders = require('on-headers');


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
    this.requireForAutoReloadServer();

    this.initPromiseRejectionWarningHandler();
    this.initSwig();
  }

  initPromiseRejectionWarningHandler() {
    // https://qiita.com/syuilo/items/0800d7e44e93203c7285
    process.on('unhandledRejection', console.dir);  // eslint-disable-line no-console
  }

  initSwig() {
    swig.setDefaults({ cache: false });
  }

  /**
   * require files for node-dev auto reloading
   */
  requireForAutoReloadServer() {
    // load all json files for live reloading
    fs.readdirSync(this.crowi.localeDir)
      .filter(filename => {
        return fs.statSync(path.join(this.crowi.localeDir, filename)).isDirectory();
      })
      .map((dirname) => {
        require(path.join(this.crowi.localeDir, dirname, 'translation.json'));
      });
  }

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
        key: fs.readFileSync(path.join(this.crowi.rootDir, './resource/certs/localhost/key.pem')),
        cert: fs.readFileSync(path.join(this.crowi.rootDir, './resource/certs/localhost/cert.pem')),
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

    this.setupExpressAfterListening(app);

    return server;
  }

  /**
   *
   * @param {any} app express
   */
  setupExpressAfterListening(app) {
    this.setupHeaderDebugger(app);
    this.setupBrowserSync(app);
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

  setupBrowserSync(app) {
    logger.debug('setupBrowserSync');

    const browserSync = require('browser-sync');
    const bs = browserSync.create().init({
      logSnippet: false,
      notify: false,
      files: [
        `${this.crowi.viewsDir}/**/*.html`,
        `${this.crowi.publicDir}/**/*.js`,
        `${this.crowi.publicDir}/**/*.css`,
      ]
    });
    app.use(require('connect-browser-sync')(bs));
  }

  loadPlugins(app) {
    if (process.env.PLUGIN_NAMES_TOBE_LOADED !== undefined
        && process.env.PLUGIN_NAMES_TOBE_LOADED.length > 0) {

      const pluginNames = process.env.PLUGIN_NAMES_TOBE_LOADED.split(',');
      logger.debug('[development] loading Plugins', pluginNames);

      // merge and remove duplicates
      if (pluginNames.length > 0) {
        const PluginService = require('../plugins/plugin.service');
        const pluginService = new PluginService(this.crowi, app);
        pluginService.loadPlugins(pluginNames);
      }
    }
  }
}

module.exports = CrowiDev;
