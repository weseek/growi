/**
 * the tool for genetion of plugin definitions source code
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
import fs from 'graceful-fs';
import normalize from 'normalize-path';
import swig from 'swig-templates';

import PluginUtils from '../src/server/plugins/plugin-utils';
import loggerFactory from '../src/utils/logger';
import { resolveFromRoot } from '../src/utils/project-dir-utils';

const logger = loggerFactory('growi:bin:generate-plugin-definitions-source');


const pluginUtils = new PluginUtils();

const TEMPLATE = resolveFromRoot('bin/templates/plugin-definitions.js.swig');
const OUT = resolveFromRoot('tmp/plugins/plugin-definitions.js');

// list plugin names
const pluginNames: string[] = pluginUtils.listPluginNames();
logger.info('Detected plugins: ', pluginNames);

// get definitions
const definitions = pluginNames
  .map((name) => {
    return pluginUtils.generatePluginDefinition(name, true);
  })
  .map((definition) => {
    if (definition == null) {
      return null;
    }

    // convert backslash to slash
    definition.entries = definition.entries.map((entryPath) => {
      return normalize(entryPath);
    });
    return definition;
  })
  .filter(definition => definition != null);

const compiledTemplate = swig.compileFile(TEMPLATE);
const code = compiledTemplate({ definitions });

// write
fs.writeFileSync(OUT, code);
