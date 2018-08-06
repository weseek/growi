const debug = require('debug')('growi:crowi:dev');
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
   *
   * @param {any} server http server
   * @param {any} app express
   *
   * @memberOf CrowiDev
   */
  setup(server, app) {
    this.setupHeaderDebugger(app);
    this.setupBrowserSync(app);
  }

  setupHeaderDebugger(app) {
    debug('setupHeaderDebugger');

    app.use((req, res, next) => {
      onHeaders(res, () => {
        debug('HEADERS GOING TO BE WRITTEN');
      });
      next();
    });
  }

  setupBrowserSync(app) {
    debug('setupBrowserSync');

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
      debug('loading Plugins for development', pluginNames);

      // merge and remove duplicates
      if (pluginNames.length > 0) {
        var PluginService = require('../plugins/plugin.service');
        var pluginService = new PluginService(this.crowi, app);
        pluginService.loadPlugins(pluginNames);
      }
    }
  }
}

module.exports = CrowiDev;
