import { mock } from 'vitest-mock-extended';

import ConfigModel from '../models/config';

import { configManager } from './config-manager';
import type { S2sMessagingService } from './s2s-messaging/base';

describe('ConfigManager test', () => {

  const s2sMessagingServiceMock = mock<S2sMessagingService>();

  beforeAll(async() => {
    process.env.CONFIG_PUBSUB_SERVER_TYPE = 'nchan';
    configManager.setS2sMessagingService(s2sMessagingServiceMock);
  });


  describe('updateConfigsInTheSameNamespace()', () => {

    test.concurrent('invoke publishUpdateMessage()', async() => {
      // setup
      ConfigModel.bulkWrite = vi.fn();
      configManager.loadConfigs = vi.fn();
      configManager.publishUpdateMessage = vi.fn();

      // when
      const dummyConfig = { dummyKey: 'dummyValue' };
      await configManager.updateConfigsInTheSameNamespace('dummyNs', dummyConfig);

      // then
      expect(ConfigModel.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).toHaveBeenCalledTimes(1);
    });

    test.concurrent('does not invoke publishUpdateMessage()', async() => {
      // setup
      ConfigModel.bulkWrite = vi.fn();
      configManager.loadConfigs = vi.fn();
      configManager.publishUpdateMessage = vi.fn();

      // when
      const dummyConfig = { dummyKey: 'dummyValue' };
      await configManager.updateConfigsInTheSameNamespace('dummyNs', dummyConfig, true);

      // then
      expect(ConfigModel.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).not.toHaveBeenCalled();
    });

  });


});
