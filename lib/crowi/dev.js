const debug = require('debug')('crowi:crowi:dev');
const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers')

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
    this.setupEasyLiveReload(app);
  }

  setupEasyLiveReload(app) {
    if (!helpers.hasProcessFlag('watch')) {
      return;
    }

    const livereload = require('easy-livereload');
    app.use(livereload({
      watchDirs: [
        path.join(this.crowi.viewsDir),
        path.join(this.crowi.publicDir),
      ],
      checkFunc: function(x) {
        return /\.(html|css|js)$/.test(x);
      },
    }));
  }

  loadPlugins(app) {
    if (process.env.PLUGIN_NAMES_TOBE_LOADED !== undefined
        && process.env.PLUGIN_NAMES_TOBE_LOADED.length > 0) {

      const pluginNames = process.env.PLUGIN_NAMES_TOBE_LOADED.split(',');

      // merge and remove duplicates
      if (pluginNames.length > 0) {
        var PluginService = require('../plugins/plugin.service');
        var pluginService = new PluginService(this.crowi, app);
        pluginService.loadPlugins(pluginNames);
      }
    }
  }
}

module.exports = CrowiDev
