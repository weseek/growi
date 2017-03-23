const debug = require('debug')('crowi:plugins:PluginLoaderV2');

class PluginLoaderV2 {

  load(name, crowi, app) {
    const meta = require(name);

    const entries = meta.serverEntries
      .map(function(entryPath) {
        return require(entryPath);
      });

    debug(`load plugin '${name}'`);

    entries.forEach((entry) => {
      entry(crowi, app);
    });
  }

}

module.exports = PluginLoaderV2;
