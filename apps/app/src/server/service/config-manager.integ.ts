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


});
