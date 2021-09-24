/**
 * the tool for genetion of plugin definitions source code
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
import fs from 'graceful-fs';
import normalize from 'normalize-path';
import swig from 'swig-templates';

import { PluginDefinitionV4 } from '@growi/core';

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

async function main(): Promise<void> {

  // get definitions
  const definitions: PluginDefinitionV4[] = [];
  for (const pluginName of pluginNames) {
    // eslint-disable-next-line no-await-in-loop
    const definition = await pluginUtils.generatePluginDefinition(pluginName, true);
    if (definition != null) {
      definitions.push(definition);
    }
  }

  definitions.map((definition) => {
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

}

main();
