import { GrowiPluginType } from '@growi/core';

import { GrowiPlugin } from './growi-plugin';

describe('GrowiPlugin find methods', () => {

  beforeAll(async() => {
    await GrowiPlugin.insertMany([
      {
        isEnabled: false,
        installedPath: 'weseek/growi-plugin-unenabled1',
        organizationName: 'weseek',
        origin: {
          url: 'https://github.com/weseek/growi-plugin-unenabled1',
        },
        meta: {
          name: '@growi/growi-plugin-unenabled1',
          types: [GrowiPluginType.Script],
        },
      },
      {
        isEnabled: false,
        installedPath: 'weseek/growi-plugin-unenabled2',
        organizationName: 'weseek',
        origin: {
          url: 'https://github.com/weseek/growi-plugin-unenabled2',
        },
        meta: {
          name: '@growi/growi-plugin-unenabled2',
          types: [GrowiPluginType.Template],
        },
      },
      {
        isEnabled: true,
        installedPath: 'weseek/growi-plugin-example1',
        organizationName: 'weseek',
        origin: {
          url: 'https://github.com/weseek/growi-plugin-example1',
        },
        meta: {
          name: '@growi/growi-plugin-example1',
          types: [GrowiPluginType.Script],
        },
      },
      {
        isEnabled: true,
        installedPath: 'weseek/growi-plugin-example2',
        organizationName: 'weseek',
        origin: {
          url: 'https://github.com/weseek/growi-plugin-example2',
        },
        meta: {
          name: '@growi/growi-plugin-example2',
          types: [GrowiPluginType.Template],
        },
      },
    ]);
  });

  describe('.findEnabledPlugins', () => {
    it('shoud returns documents which isEnabled is true', async() => {
      // when
      const results = await GrowiPlugin.findEnabledPlugins();

      const pluginNames = results.map(p => p.meta.name);

      // then
      expect(results.length === 2).toBeTruthy();
      expect(pluginNames.includes('@growi/growi-plugin-example1')).toBeTruthy();
      expect(pluginNames.includes('@growi/growi-plugin-example2')).toBeTruthy();
    });
  });

  describe('.findEnabledPluginsByType', () => {
    it("shoud returns documents which type is 'template'", async() => {
      // when
      const results = await GrowiPlugin.findEnabledPluginsByType(GrowiPluginType.Template);

      const pluginNames = results.map(p => p.meta.name);

      // then
      expect(results.length === 1).toBeTruthy();
      expect(pluginNames.includes('@growi/growi-plugin-example2')).toBeTruthy();
    });
  });

});
