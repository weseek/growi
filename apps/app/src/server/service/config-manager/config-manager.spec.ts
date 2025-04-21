import { mock } from 'vitest-mock-extended';

import type { S2sMessagingService } from '../s2s-messaging/base';

import { configManager } from './config-manager';

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
};

describe('ConfigManager test', () => {
  const s2sMessagingServiceMock = mock<S2sMessagingService>();

  beforeAll(async () => {
    process.env.CONFIG_PUBSUB_SERVER_TYPE = 'nchan';
    configManager.setS2sMessagingService(s2sMessagingServiceMock);
  });

  describe('updateConfig()', () => {
    let loadConfigsSpy;
    beforeEach(async () => {
      loadConfigsSpy = vi.spyOn(configManager, 'loadConfigs');
    });

    test('invoke publishUpdateMessage()', async () => {
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

    test('skip publishUpdateMessage()', async () => {
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
    beforeEach(async () => {
      loadConfigsSpy = vi.spyOn(configManager, 'loadConfigs');
    });

    test('invoke publishUpdateMessage()', async () => {
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

    test('skip publishUpdateMessage()', async () => {
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
    beforeAll(async () => {
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
});
