import type { RawConfigData } from '@growi/core/dist/interfaces';
import { mock } from 'vitest-mock-extended';

import type { S2sMessagingService } from '../s2s-messaging/base';

import type { ConfigKey, ConfigValues } from './config-definition';
import { configManager } from './config-manager';

// Test helper type for setting configs
type TestConfigData = RawConfigData<ConfigKey, ConfigValues>;

const mocks = vi.hoisted(() => ({
  ConfigMock: {
    updateOne: vi.fn(),
    bulkWrite: vi.fn(),
  },
}));
vi.mock('../../models/config', () => ({
  Config: mocks.ConfigMock,
}));


type ConfigManagerToGetLoader = {
  configLoader: { loadFromDB: () => void };
}


describe('ConfigManager test', () => {

  const s2sMessagingServiceMock = mock<S2sMessagingService>();

  beforeAll(async() => {
    process.env.CONFIG_PUBSUB_SERVER_TYPE = 'nchan';
    configManager.setS2sMessagingService(s2sMessagingServiceMock);
  });


  describe('updateConfig()', () => {

    let loadConfigsSpy;
    beforeEach(async() => {
      loadConfigsSpy = vi.spyOn(configManager, 'loadConfigs');
    });

    test('invoke publishUpdateMessage()', async() => {
      // arrenge
      configManager.publishUpdateMessage = vi.fn();
      vi.spyOn((configManager as unknown as ConfigManagerToGetLoader).configLoader, 'loadFromDB').mockImplementation(vi.fn());

      // act
      await configManager.updateConfig('app:siteUrl', '');

      // assert
      expect(mocks.ConfigMock.updateOne).toHaveBeenCalledTimes(1);
      expect(loadConfigsSpy).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).toHaveBeenCalledTimes(1);
    });

    test('skip publishUpdateMessage()', async() => {
      // arrenge
      configManager.publishUpdateMessage = vi.fn();
      vi.spyOn((configManager as unknown as ConfigManagerToGetLoader).configLoader, 'loadFromDB').mockImplementation(vi.fn());

      // act
      await configManager.updateConfig('app:siteUrl', '', { skipPubsub: true });

      // assert
      expect(mocks.ConfigMock.updateOne).toHaveBeenCalledTimes(1);
      expect(loadConfigsSpy).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).not.toHaveBeenCalled();
    });

  });

  describe('updateConfigs()', () => {

    let loadConfigsSpy;
    beforeEach(async() => {
      loadConfigsSpy = vi.spyOn(configManager, 'loadConfigs');
    });

    test('invoke publishUpdateMessage()', async() => {
      // arrenge
      configManager.publishUpdateMessage = vi.fn();
      vi.spyOn((configManager as unknown as ConfigManagerToGetLoader).configLoader, 'loadFromDB').mockImplementation(vi.fn());

      // act
      await configManager.updateConfig('app:siteUrl', '');

      // assert
      // expect(Config.bulkWrite).toHaveBeenCalledTimes(1);
      expect(loadConfigsSpy).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).toHaveBeenCalledTimes(1);
    });

    test('skip publishUpdateMessage()', async() => {
      // arrange
      configManager.publishUpdateMessage = vi.fn();
      vi.spyOn((configManager as unknown as ConfigManagerToGetLoader).configLoader, 'loadFromDB').mockImplementation(vi.fn());

      // act
      await configManager.updateConfigs({ 'app:siteUrl': '' }, { skipPubsub: true });

      // assert
      // expect(Config.bulkWrite).toHaveBeenCalledTimes(1);
      expect(loadConfigsSpy).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).not.toHaveBeenCalled();
    });
  });

  describe('getManagedEnvVars()', () => {
    beforeAll(async() => {
      process.env.AUTO_INSTALL_ADMIN_USERNAME = 'admin';
      process.env.AUTO_INSTALL_ADMIN_PASSWORD = 'password';

      await configManager.loadConfigs({ source: 'env' });
    });

    test('include secret', () => {
      // act
      const result = configManager.getManagedEnvVars(true);

      // assert
      expect(result.AUTO_INSTALL_ADMIN_USERNAME).toEqual('admin');
      expect(result.AUTO_INSTALL_ADMIN_PASSWORD).toEqual('password');
    });

    test('exclude secret', () => {
      // act
      const result = configManager.getManagedEnvVars();

      // assert
      expect(result.AUTO_INSTALL_ADMIN_USERNAME).toEqual('admin');
      expect(result.AUTO_INSTALL_ADMIN_PASSWORD).toEqual('***');
    });
  });

  describe('getConfig()', () => {
    // Helper function to set configs with proper typing
    const setTestConfigs = (dbConfig: Partial<TestConfigData>, envConfig: Partial<TestConfigData>): void => {
      Object.defineProperties(configManager, {
        dbConfig: { value: dbConfig, configurable: true },
        envConfig: { value: envConfig, configurable: true },
      });
    };

    beforeEach(async() => {
      // Reset configs before each test using properly typed empty objects
      setTestConfigs({}, {});
    });

    test('should fallback to env value when dbConfig[key] exists but its value is undefined', async() => {
      // Prepare test data that simulates the issue with proper typing
      const dbConfig: Partial<TestConfigData> = {
        'app:title': { value: undefined },
      };
      const envConfig: Partial<TestConfigData> = {
        'app:title': { value: 'GROWI' },
      };
      setTestConfigs(dbConfig, envConfig);

      // Act
      const result = configManager.getConfig('app:title');

      // Assert - Should return env value since db value is undefined
      expect(result).toBe('GROWI');
    });

    test('should handle various edge case scenarios correctly', async() => {
      // Setup multiple test scenarios with proper typing
      const dbConfig: Partial<TestConfigData> = {
        'app:title': { value: undefined }, // db value is explicitly undefined
        'app:siteUrl': { value: undefined }, // another undefined value
        'app:fileUpload': undefined, // db config entry itself is undefined
        'app:fileUploadType': { value: 'gridfs' }, // db has valid value
      };
      const envConfig: Partial<TestConfigData> = {
        'app:title': { value: 'GROWI' },
        'app:siteUrl': { value: 'https://example.com' },
        'app:fileUpload': { value: true },
        'app:fileUploadType': { value: 'aws' },
        // Add control flags for env vars
        'env:useOnlyEnvVars:app:siteUrl': { value: false },
        'env:useOnlyEnvVars:app:fileUploadType': { value: false },
      };
      setTestConfigs(dbConfig, envConfig);

      // Test each scenario
      expect(configManager.getConfig('app:title')).toBe('GROWI'); // Should fallback to env when db value is undefined
      expect(configManager.getConfig('app:siteUrl')).toBe('https://example.com'); // Should fallback to env when db value is undefined
      expect(configManager.getConfig('app:fileUpload')).toBe(true); // Should fallback to env when db config is undefined
      expect(configManager.getConfig('app:fileUploadType')).toBe('gridfs'); // Should use db value when valid
    });
  });

});
