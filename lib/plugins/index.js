const plugins = {
  // 'crowi-plugin-X': {
  //   meta: require('crowi-plugin-X'),
  //   entries: [
  //     require('crowi-plugin-X/lib/server-entry')
  //   ]
  // },
}

module.exports = function(crowi, app) {
  var debug = require('debug')('crowi:plugins');

  for (var pluginName of Object.keys(plugins)) {
    var meta = plugins[pluginName].meta;
    var entries = plugins[pluginName].entries;

    // v1 is deprecated

    // v2
    if (2 === meta.pluginSchemaVersion) {
      debug(`import plugin entries for '${pluginName}'`);

      entries.forEach((entry) => {
        entry(crowi, app);
      });
    }
  }
}
