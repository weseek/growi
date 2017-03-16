const debug = require('debug')('crowi:crowi:dev');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const reload = require('reload');
const chokidar = require('chokidar');

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

  setupLiveReloadTools() {
    // Webpack HMR settings
    const webpackConfig = require('../../webpack.config');
    var compiler = webpack(webpackConfig);
    this.app.use(webpackDevMiddleware(compiler, {
      noInfo: true, publicPath: webpackConfig.output.publicPath
    }));
    this.app.use(webpackHotMiddleware(compiler));

    // reload settings
    // see: https://github.com/glenjamin/webpack-hot-middleware
    // see: https://github.com/jprichardson/reload
    const reloadServer = reload(this.server, this.app);
    // fire reload() when views are modified
    const watcher = chokidar.watch(path.join(this.crowi.libDir, 'views'));
    watcher.on('all', (event, path) => {
      reloadServer.reload();
    });

    // debug(`watching for live-reloading -> ${this.crowi.libDir}`);
  }
}

module.exports = CrowiDev
