export default class CrowiPlugin {

  /**
   * process plugin entry
   *
   * @param {Crowi} crowi Crowi context class
   * @param {CrowiRenderer} crowiRenderer CrowiRenderer
   *
   * @memberof CrowiPlugin
   */
  installAll(crowi, crowiRenderer) {
    // import plugin definitions
    let definitions = [];
    try {
      definitions = require('@tmp/plugins/plugin-definitions');
    }
    catch (e) {
      // TODO show warning
      // do nothing
      return;
    }

    definitions.forEach((definition) => {
      const meta = definition.meta;

      switch (meta.pluginSchemaVersion) {
        // v1 is deprecated
        case 1:
          break;
        // v2 or above
        default:
          definition.entries.forEach((entry) => {
            entry(crowi, crowiRenderer);
          });
      }
    });

  }

}

window.crowiPlugin = new CrowiPlugin();     // FIXME
