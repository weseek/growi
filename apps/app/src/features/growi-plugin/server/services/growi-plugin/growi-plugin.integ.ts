import fs from 'fs';
import path from 'path';

import { PLUGIN_STORING_PATH } from '../../consts';

import { growiPluginService } from './growi-plugin';

describe('Installing a GROWI template plugin', () => {

  it('should success', async() => {
    // when
    const result = await growiPluginService.install({
      url: 'https://github.com/weseek/growi-plugin-templates-for-office',
    });

    // expect
    expect(result).toEqual('growi-plugin-templates-for-office');
    expect(fs.existsSync(path.join(
      PLUGIN_STORING_PATH,
      'weseek',
      'growi-plugin-templates-for-office',
    ))).toBeTruthy();
  });

  it('should success (re-install)', async() => {
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

    // expect
    expect(result).toEqual('growi-plugin-templates-for-office');
    expect(fs.existsSync(dummyFilePath)).toBeFalsy(); // the dummy file should be removed
  });

});
