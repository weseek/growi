const plugins = {
  // 'crowi-plugin-X': {
  //   meta: require('crowi-plugin-X'),
  //   entries: [
  //     require('crowi-plugin-X/lib/client-entry')
  //   ]
  // },
}

export default class CrowiPlugin {

  /**
   * process plugin entry
   * 
   * @param {Crowi} crowi
   * @param {CrowiRenderer} crowiRenderer
   * 
   * @memberof CrowiPlugin
   */
  installAll(crowi, crowiRenderer) {
    for (let pluginName of Object.keys(plugins)) {
      let meta = plugins[pluginName].meta;
      let entries = plugins[pluginName].entries;

      // v1 is deprecated

      // v2
      if (2 === meta.pluginSchemaVersion) {
        entries.forEach((entry) => {
          entry(crowi, crowiRenderer);
        });
      }
    }
  }

}

window.crowiPlugin = new CrowiPlugin();     // FIXME