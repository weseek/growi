/**
 * the tool for genetion of plugin definitions source code
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
const fs = require('graceful-fs');
const normalize = require('normalize-path');
const swig = require('swig-templates');
const helpers = require('../config/helpers');

const TEMPLATE = helpers.root('bin/templates/plugin-definitions.js.swig');
const OUT = helpers.root('tmp/plugins/plugin-definitions.js');

const PluginUtils = require('../src/server/plugins/plugin-utils');
const pluginUtils = new PluginUtils();


// list plugin names
let pluginNames = pluginUtils.listPluginNames(helpers.root());
// add from PLUGIN_NAMES_TOBE_LOADED when development
if (process.env.NODE_ENV === 'development'
    && process.env.PLUGIN_NAMES_TOBE_LOADED !== undefined
    && process.env.PLUGIN_NAMES_TOBE_LOADED.length > 0) {

  const pluginNamesDev = process.env.PLUGIN_NAMES_TOBE_LOADED.split(',');

  // merge and remove duplicates
  if (pluginNamesDev.length > 0) {
    pluginNames = pluginNames.concat(pluginNamesDev);
    pluginNames = Array.from(new Set(pluginNames));
  }
}


// get definitions
const definitions = pluginNames
  .map((name) => {
    return pluginUtils.generatePluginDefinition(name, true);
  })
  .map((definition) => {
    // convert backslash to slash
    definition.entries = definition.entries.map((entryPath) => {
      return normalize(entryPath);
    });
    return definition;
  });

const compiledTemplate = swig.compileFile(TEMPLATE);
const code = compiledTemplate({definitions});

// write
fs.writeFileSync(OUT, code);
