const fs = require('graceful-fs');
const slash = require('slash');
const swig = require('swig');
const helpers = require('../config/helpers');

const PluginUtils = require('../lib/plugins/plugin-utils');
const pluginUtils = new PluginUtils();

const definitions = pluginUtils.listPluginNames(helpers.root())
  .map((name) => {
    return pluginUtils.generatePluginDefinition(name, true);
  })
  .map((definition) => {
    // convert backslash to slash
    definition.entries = definition.entries.map((entryPath) => {
      return slash(entryPath);
    });
    return definition;
  });

var template = swig.compileFile(helpers.root('bin/templates/plugin-definitions.js.swig'));
var output = template({definitions});

fs.writeFileSync(
  helpers.root('resource/js/plugins/plugin-definitions.js'),
  output);
