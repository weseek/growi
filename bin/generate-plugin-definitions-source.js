/**
 * the tool for genetion of plugin definitions source code
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
import loggerFactory from '~/utils/logger';
import { projectRoot, resolveFromRoot } from '~/utils/project-dir-utils';

const logger = loggerFactory('growi:bin:generate-plugin-definitions-source');

const fs = require('graceful-fs');
const normalize = require('normalize-path');
const swig = require('swig-templates');

const PluginUtils = require('~/server/plugins/plugin-utils');

const pluginUtils = new PluginUtils();

const TEMPLATE = resolveFromRoot('bin/templates/plugin-definitions.js.swig');
const OUT = resolveFromRoot('tmp/plugins/plugin-definitions.js');


// list plugin names
let pluginNames = pluginUtils.listPluginNames(projectRoot);
logger.info('Detected plugins: ', pluginNames);

// add from PLUGIN_NAMES_TOBE_LOADED when development
if (process.env.NODE_ENV === 'development'
    && process.env.PLUGIN_NAMES_TOBE_LOADED !== undefined
    && process.env.PLUGIN_NAMES_TOBE_LOADED.length > 0) {
  const pluginNamesDev = process.env.PLUGIN_NAMES_TOBE_LOADED.split(',');

  logger.info('Detected plugins from PLUGIN_NAMES_TOBE_LOADED: ', pluginNamesDev);

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
const code = compiledTemplate({ definitions });

// write
fs.writeFileSync(OUT, code);
