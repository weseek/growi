const debug = require('debug')('crowi:plugins');
const PluginService = require('./plugin.service');

module.exports = function(crowi, app) {
  const pluginService = new PluginService(crowi, app);
  pluginService.loadPlugins();
}
