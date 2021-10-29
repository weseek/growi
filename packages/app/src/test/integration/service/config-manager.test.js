import ConfigModel from '~/server/models/config';

const { getInstance } = require('../setup-crowi');

describe('ConfigManager test', () => {
  let crowi;
  let configManager;

  beforeEach(async() => {
    process.env.CONFIG_PUBSUB_SERVER_TYPE = 'nchan';

    crowi = await getInstance();
    configManager = crowi.configManager;
  });


  describe('updateConfigsInTheSameNamespace()', () => {

    beforeEach(async() => {
      configManager.s2sMessagingService = {};
    });

    test('invoke publishUpdateMessage()', async() => {
      ConfigModel.bulkWrite = jest.fn();
      configManager.loadConfigs = jest.fn();
      configManager.publishUpdateMessage = jest.fn();

      const dummyConfig = { dummyKey: 'dummyValue' };
      await configManager.updateConfigsInTheSameNamespace('dummyNs', dummyConfig);

      expect(ConfigModel.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).toHaveBeenCalledTimes(1);
    });

    test('does not invoke publishUpdateMessage()', async() => {
      ConfigModel.bulkWrite = jest.fn();
      configManager.loadConfigs = jest.fn();
      configManager.publishUpdateMessage = jest.fn();

      const dummyConfig = { dummyKey: 'dummyValue' };
      await configManager.updateConfigsInTheSameNamespace('dummyNs', dummyConfig, true);

      expect(ConfigModel.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).not.toHaveBeenCalled();
    });

  });


});
