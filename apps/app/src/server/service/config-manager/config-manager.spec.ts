import { mock } from 'vitest-mock-extended';

import { Config } from '../models/config';

import { configManager } from './config-manager';
import type { S2sMessagingService } from './s2s-messaging/base';

describe('ConfigManager test', () => {

  const s2sMessagingServiceMock = mock<S2sMessagingService>();

  beforeAll(async() => {
    process.env.CONFIG_PUBSUB_SERVER_TYPE = 'nchan';
    configManager.setS2sMessagingService(s2sMessagingServiceMock);
  });


  describe('updateConfigsInTheSameNamespace()', () => {

    test('invoke publishUpdateMessage()', async() => {
      // setup
      Config.bulkWrite = vi.fn();
      configManager.loadConfigs = vi.fn();
      configManager.publishUpdateMessage = vi.fn();

      // when
      const dummyConfig = { dummyKey: 'dummyValue' };
      await configManager.updateConfigsInTheSameNamespace('dummyNs', dummyConfig);

      // then
      expect(Config.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).toHaveBeenCalledTimes(1);
    });

    test('does not invoke publishUpdateMessage()', async() => {
      // setup
      Config.bulkWrite = vi.fn();
      configManager.loadConfigs = vi.fn();
      configManager.publishUpdateMessage = vi.fn();

      // when
      const dummyConfig = { dummyKey: 'dummyValue' };
      await configManager.updateConfigsInTheSameNamespace('dummyNs', dummyConfig, true);

      // then
      expect(Config.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).not.toHaveBeenCalled();
    });

  });


});
