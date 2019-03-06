const path = require('path');

class PluginUtilsV2 {
  /**
   * return a definition objects that has following structure:
   *
   * {
   *   name: 'crowi-plugin-X',
   *   meta: require('crowi-plugin-X'),
   *   entries: [
   *     'crowi-plugin-X/lib/client-entry'
   *   ]
   * }
   *
   *
   * @param {string} pluginName
   * @return
   * @memberOf PluginService
   */
  generatePluginDefinition(name, isForClient = false) {
    const meta = require(name);
    let entries = (isForClient) ? meta.clientEntries : meta.serverEntries;

    entries = entries.map((entryPath) => {
      const moduleRoot = path.resolve(require.resolve(`${name}/package.json`), '..');
      const entryRelativePath = path.relative(moduleRoot, entryPath);
      return path.join(name, entryRelativePath);
    });

    return {
      name,
      meta,
      entries,
    };
  }
}

module.exports = PluginUtilsV2;
