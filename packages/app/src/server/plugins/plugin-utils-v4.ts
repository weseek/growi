import path from 'path';

import { PluginMetaV4, PluginDefinitionV4 } from '@growi/core';

export class PluginUtilsV4 {

  /**
   * return a definition objects that has following structure:
   *
   * {
   *   name: 'crowi-plugin-X',
   *   meta: require('crowi-plugin-X'),
   *   entries: [
   *     'crowi-plugin-X/lib/client-entry'
   *   ]
   * }
   *
   *
   * @param {string} pluginName
   * @return
   * @memberOf PluginService
   */
  async generatePluginDefinition(name: string, isForClient = false): Promise<PluginDefinitionV4> {
    const meta: PluginMetaV4 = await import(name);
    let entries = (isForClient) ? meta.clientEntries : meta.serverEntries;

    entries = entries.map((entryPath) => {
      return path.join(name, entryPath);
    });

    return {
      name,
      meta,
      entries,
    };
  }

}
