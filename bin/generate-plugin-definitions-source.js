/**
 * the tool for genetion of plugin definitions source code
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
require('module-alias/register');
const logger = require('@alias/logger')('growi:bin:generate-plugin-definitions-source');

const fs = require('graceful-fs');
const normalize = require('normalize-path');
const swig = require('swig-templates');

const helpers = require('@commons/util/helpers');
const PluginUtils = require('@server/plugins/plugin-utils');

const pluginUtils = new PluginUtils();

const TEMPLATE = helpers.root('bin/templates/plugin-definitions.js.swig');
const OUT = helpers.root('tmp/plugins/plugin-definitions.js');


// list plugin names
const pluginNames = pluginUtils.listPluginNames(helpers.root());
logger.info('Detected plugins: ', pluginNames);

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
const code = compiledTemplate({ definitions });

// write
fs.writeFileSync(OUT, code);
