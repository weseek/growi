/**
 * the tool for genetion of plugin definitions source code
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
const fs = require('graceful-fs');
const slash = require('slash');
const swig = require('swig');
const helpers = require('../config/helpers');

const TEMPLATE = helpers.root('bin/templates/plugin-definitions.js.swig');
const OUT = helpers.root('resource/js/plugins/plugin-definitions.js');

const PluginUtils = require('../lib/plugins/plugin-utils');
const pluginUtils = new PluginUtils();

// get definitions
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

var compiledTemplate = swig.compileFile(TEMPLATE);
var code = compiledTemplate({definitions});

// write
fs.writeFileSync(OUT, code);
