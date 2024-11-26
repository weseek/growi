import { mock } from 'vitest-mock-extended';

import { Config } from '../../models/config';
import type { S2sMessagingService } from '../s2s-messaging/base';

import { configManager } from './config-manager';

describe('ConfigManager test', () => {

  const s2sMessagingServiceMock = mock<S2sMessagingService>();

  beforeAll(async() => {
    process.env.CONFIG_PUBSUB_SERVER_TYPE = 'nchan';
    configManager.setS2sMessagingService(s2sMessagingServiceMock);
  });


  describe('updateConfig()', () => {

    test('invoke publishUpdateMessage()', async() => {
      // arrenge
      Config.updateOne = vi.fn();
      configManager.loadConfigs = vi.fn();
      configManager.publishUpdateMessage = vi.fn();

      // act
      await configManager.updateConfig('app:siteUrl', '');

      // assert
      expect(Config.updateOne).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).toHaveBeenCalledTimes(1);
    });

    test('skip publishUpdateMessage()', async() => {
      // arrenge
      Config.updateOne = vi.fn();
      configManager.loadConfigs = vi.fn();
      configManager.publishUpdateMessage = vi.fn();

      // act
      await configManager.updateConfig('app:siteUrl', '', { skipPubsub: true });

      // assert
      expect(Config.updateOne).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).not.toHaveBeenCalled();
    });

  });

  describe('updateConfigs()', () => {

    test('invoke publishUpdateMessage()', async() => {
      // arrenge
      Config.bulkWrite = vi.fn();
      configManager.loadConfigs = vi.fn();
      configManager.publishUpdateMessage = vi.fn();

      // act
      await configManager.updateConfig('app:siteUrl', '');

      // assert
      expect(Config.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).toHaveBeenCalledTimes(1);
    });

    test('skip publishUpdateMessage()', async() => {
      // arrange
      Config.bulkWrite = vi.fn();
      configManager.loadConfigs = vi.fn();
      configManager.publishUpdateMessage = vi.fn();

      // act
      await configManager.updateConfigs({ 'app:siteUrl': '' }, { skipPubsub: true });

      // assert
      expect(Config.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).not.toHaveBeenCalled();
    });
  });

  describe('getManagedEnvVars()', () => {

    beforeAll(() => {
      process.env.AUTO_INSTALL_ADMIN_USERNAME = 'admin';
      process.env.AUTO_INSTALL_ADMIN_PASSWORD = 'password';

      configManager.loadConfigs({ source: 'env' });
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
