import { mock } from 'vitest-mock-extended';

import { Config } from '../models/config';

import { configManager } from './config-manager';
import type { S2sMessagingService } from './s2s-messaging/base';

describe('ConfigManager', () => {

  const s2sMessagingServiceMock = mock<S2sMessagingService>();

  beforeAll(async() => {
    configManager.setS2sMessagingService(s2sMessagingServiceMock);
  });


  describe("getConfig('app:siteUrl')", () => {

    beforeEach(async() => {
      process.env.APP_SITE_URL = 'http://localhost:3000';

      // remove config from DB
      await Config.deleteOne({ ns: 'crowi', key: 'app:siteUrl' }).exec();
    });

    test('returns the env value"', async() => {
      // arrange
      await configManager.loadConfigs();

      // act
      const value = configManager.getConfig('crowi', 'app:siteUrl');

      // assert
      expect(value).toEqual('http://localhost:3000');
    });

    test('returns the db value"', async() => {
      // arrange
      await Config.create({ ns: 'crowi', key: 'app:siteUrl', value: JSON.stringify('https://example.com') });
      await configManager.loadConfigs();

      // act
      const value = configManager.getConfig('crowi', 'app:siteUrl');

      // assert
      expect(value).toEqual('https://example.com');
    });

    test('returns the env value when USES_ONLY_ENV_OPTION is set', async() => {
      // arrange
      process.env.APP_SITE_URL_USES_ONLY_ENV_VARS = 'true';
      await Config.create({ ns: 'crowi', key: 'app:siteUrl', value: JSON.stringify('https://example.com') });
      await configManager.loadConfigs();

      // act
      const value = configManager.getConfig('crowi', 'app:siteUrl');

      // assert
      expect(value).toEqual('http://localhost:3000');
    });

  });

  describe('updateConfigsInTheSameNamespace', () => {
    beforeEach(async() => {
      await Config.deleteMany({ ns: 'testNamespace' }).exec();
      await Config.create({ ns: 'testNamespace', key: 'key1', value: JSON.stringify('value1') });
    });

    test('updates configs in the same namespace', async() => {
      // arrange
      await configManager.loadConfigs();

      // act
      await configManager.updateConfigsInTheSameNamespace('testNamespace', {
        key1: 'new value1',
        key2: 'new value2',
      });
      const updatedConfig1 = await Config.findOne({ ns: 'testNamespace', key: 'key1' }).exec();
      const updatedConfig2 = await Config.findOne({ ns: 'testNamespace', key: 'key2' }).exec();

      // assert
      expect(updatedConfig1?.value).toEqual(JSON.stringify('new value1'));
      expect(updatedConfig2?.value).toEqual(JSON.stringify('new value2'));
    });
  });

  describe('removeConfigsInTheSameNamespace', () => {
    beforeEach(async() => {
      await Config.create({ ns: 'testNamespace', key: 'key3', value: JSON.stringify('value3') });
      await Config.create({ ns: 'testNamespace', key: 'key4', value: JSON.stringify('value4') });
    });

    test('removes configs in the same namespace', async() => {
      // arrange
      await configManager.loadConfigs();

      // act
      await configManager.removeConfigsInTheSameNamespace('testNamespace', ['key3', 'key4']);
      const removedConfig3 = await Config.findOne({ ns: 'testNamespace', key: 'key3' }).exec();
      const removedConfig4 = await Config.findOne({ ns: 'testNamespace', key: 'key4' }).exec();

      // assert
      expect(removedConfig3).toBeNull();
      expect(removedConfig4).toBeNull();
    });
  });

});
