const plugins = [
  // require('crowi-plugin-...'),
]

const pluginEntries = [
  // require('crowi-plugin-.../lib/client-entry'),
];

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
    pluginEntries.forEach((entry) => {
      entry(crowi, crowiRenderer);
    });
  }

}

window.crowiPlugin = new CrowiPlugin();     // FIXME