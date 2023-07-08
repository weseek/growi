import fs from 'fs';
import path from 'path';

import { PLUGIN_STORING_PATH } from '../../consts';
import { GrowiPlugin } from '../../models';

import { growiPluginService } from './growi-plugin';

describe('Installing a GROWI template plugin', () => {

  it('install() should success', async() => {
    // when
    const result = await growiPluginService.install({
      url: 'https://github.com/weseek/growi-plugin-templates-for-office',
    });
    const count = await GrowiPlugin.count({ 'meta.name': 'growi-plugin-templates-for-office' });

    // expect
    expect(result).toEqual('growi-plugin-templates-for-office');
    expect(count).toBe(1);
    expect(fs.existsSync(path.join(
      PLUGIN_STORING_PATH,
      'weseek',
      'growi-plugin-templates-for-office',
    ))).toBeTruthy();
  });

  it('install() should success (re-install)', async() => {
    // confirm
    const count1 = await GrowiPlugin.count({ 'meta.name': 'growi-plugin-templates-for-office' });
    expect(count1).toBe(1);

    // setup
    const dummyFilePath = path.join(
      PLUGIN_STORING_PATH,
      'weseek',
      'growi-plugin-templates-for-office',
      'dummy.txt',
    );
    fs.appendFileSync(dummyFilePath, '');
    expect(fs.existsSync(dummyFilePath)).toBeTruthy();

    // when
    const result = await growiPluginService.install({
      url: 'https://github.com/weseek/growi-plugin-templates-for-office',
    });
    const count2 = await GrowiPlugin.count({ 'meta.name': 'growi-plugin-templates-for-office' });

    // expect
    expect(result).toEqual('growi-plugin-templates-for-office');
    expect(count2).toBe(1);
    expect(fs.existsSync(dummyFilePath)).toBeFalsy(); // the dummy file should be removed
  });

});

describe('Installing a GROWI theme plugin', () => {

  it('install() should success', async() => {
    // when
    const result = await growiPluginService.install({
      url: 'https://github.com/weseek/growi-plugin-theme-welcome-to-fumiya-room',
    });
    const count = await GrowiPlugin.count({ 'meta.name': 'growi-plugin-theme-welcome-to-fumiya-room' });

    // expect
    expect(result).toEqual('growi-plugin-theme-welcome-to-fumiya-room');
    expect(count).toBe(1);
    expect(fs.existsSync(path.join(
      PLUGIN_STORING_PATH,
      'weseek',
      'growi-plugin-theme-welcome-to-fumiya-room',
    ))).toBeTruthy();
  });

  it('findThemePlugin() should return data with metadata and manifest', async() => {
    // confirm
    const count = await GrowiPlugin.count({ 'meta.name': 'growi-plugin-theme-welcome-to-fumiya-room' });
    expect(count).toBe(1);

    // when
    const results = await growiPluginService.findThemePlugin('welcome-to-fumiya-room');

    // expect
    // expect(results).not.toBeNull();
    // assert(results != null);
    // expect(results.growiPlugin).not.toBeNull();
    // expect(results.themeMetadata).not.toBeNull();
    // expect(results.themeHref).not.toBeNull();
  });

});
