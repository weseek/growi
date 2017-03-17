const debug = require('debug')('crowi:crowi:dev');
const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers')


class CrowiDev {

  /**
   * Creates an instance of CrowiDev.
   * @param {Crowi} crowi
   * @param {any} server http server
   * @param {any} app express
   *
   * @memberOf CrowiDev
   */
  constructor(crowi, server, app) {
    this.crowi = crowi;
    this.server = server;
    this.app = app;
  }

  setupTools() {
    if (helpers.hasProcessFlag('autorefresh')) {
      this.setupReload();
    }
  }

  setupReload() {
    const reload = require('reload');
    const chokidar = require('chokidar');

    // refreshing browser settings
    // see: https://github.com/jprichardson/reload
    const reloadServer = reload(this.server, this.app);

    const watcher = chokidar.watch([
      path.join(this.crowi.viewsDir),
      path.join(this.crowi.publicDir),
    ]);

    // fire reload() when changes detected
    watcher.on('all', (event, path) => {
      reloadServer.reload();
    });

    debug(`watching for live-reloading -> ${this.crowi.libDir}`);
  }
}

module.exports = CrowiDev
