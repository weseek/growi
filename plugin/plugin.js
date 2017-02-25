const plugins = [
  // require('crowi-plugin-...')
]

// import all plugins
var pluginMetaDatas = [];
plugins.forEach((plugin) => {
  pluginMetaDatas.push(plugin.meta);
})

export default class CrowiPlugin {

  /**
   * plug-in PreProcessors
   * 
   * @param {Crowi} crowi
   * @param {CrowiRenderer} crowiRenderer
   * 
   * @memberof CrowiPlugin
   */
  pluginPreProcessors(crowi, crowiRenderer) {
    var additionalPreProcessors = [];

    pluginMetaDatas.forEach((meta) => {
      // v1
      if (meta.pluginSchemaVersion === 1) {
        meta.preProcessorFactories.forEach((f) => {
          // instanciate PreProcessor
          var preProcessor = f(crowi);
          additionalPreProcessors.push(preProcessor);
        })
      }
    });

    crowiRenderer.preProcessors = crowiRenderer.preProcessors.concat(
        crowiRenderer.preProcessors, additionalPreProcessors);
  }

}

window.crowiPlugin = new CrowiPlugin();     // FIXME