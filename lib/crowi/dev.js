const debug = require('debug')('crowi:crowi:dev');
const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');

const swig = require('swig-templates');
const LRWebSocketServer = require('livereload-server/lib/server');

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
    this.initSwig();
    this.hackLRWebSocketServer();
  }

  initSwig() {
    swig.setDefaults({ cache: false });
  }

  /**
   * prevent to crash socket with:
   * -------------------------------------------------
   * Error: read ECONNRESET
   *     at exports._errnoException (util.js:1022:11)
   *     at TCP.onread (net.js:569:26)
   * -------------------------------------------------
   *
   * @see https://github.com/napcs/node-livereload/pull/15
   *
   * @memberOf CrowiDev
   */
  hackLRWebSocketServer() {
    const orgCreateConnection = LRWebSocketServer.prototype._createConnection;

    // replace https://github.com/livereload/livereload-server/blob/v0.2.3/lib/server.coffee#L74
    LRWebSocketServer.prototype._createConnection = function(socket) {
      // call original method with substituting 'this' obj
      orgCreateConnection.call(this, socket);

      socket.on('error', (err) => {
        console.warn(`[WARN] An insignificant error occured in client socket: '${err}'`);
      });
    }
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
    if (!helpers.hasProcessFlag('livereload')) {
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
