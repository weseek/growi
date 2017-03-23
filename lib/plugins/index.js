const PluginService = require('./plugin.service');

module.exports = function(crowi, app) {
  var debug = require('debug')('crowi:plugins');

  const pluginService = new PluginService(crowi, app);
  pluginService.loadPlugins();
}
