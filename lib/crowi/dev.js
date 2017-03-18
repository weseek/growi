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
    this.setupEasyLiveReload();
  }

  setupEasyLiveReload() {
    const livereload = require('easy-livereload');
    this.app.use(livereload({
      watchDirs: [
        path.join(this.crowi.viewsDir),
      ],
      checkFunc: function(x) {
        return /\.(html|css|js)$/.test(x);
      },
    }));
  }

}

module.exports = CrowiDev
