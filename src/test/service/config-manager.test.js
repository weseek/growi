const { getInstance } = require('../setup-crowi');

describe('ConfigManager test', () => {
  let crowi;
  let configManager;

  beforeEach(async(done) => {
    process.env.CONFIG_PUBSUB_SERVER_TYPE = 'nchan';

    crowi = await getInstance();
    configManager = crowi.configManager;
    done();
  });


  describe('updateConfigsInTheSameNamespace()', () => {

    const configModelMock = {};

    beforeEach(async(done) => {
      configManager.configPubsub = {};

      // prepare mocks for updateConfigsInTheSameNamespace method
      configManager.configModel = configModelMock;

      done();
    });

    test('invoke publishUpdateMessage()', async() => {
      configModelMock.bulkWrite = jest.fn();
      configManager.loadConfigs = jest.fn();
      configManager.publishUpdateMessage = jest.fn();

      const dummyConfig = { dummyKey: 'dummyValue' };
      await configManager.updateConfigsInTheSameNamespace('dummyNs', dummyConfig);

      expect(configModelMock.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).toHaveBeenCalledTimes(1);
    });

    test('does not invoke publishUpdateMessage()', async() => {
      configModelMock.bulkWrite = jest.fn();
      configManager.loadConfigs = jest.fn();
      configManager.publishUpdateMessage = jest.fn();

      const dummyConfig = { dummyKey: 'dummyValue' };
      await configManager.updateConfigsInTheSameNamespace('dummyNs', dummyConfig, true);

      expect(configModelMock.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.loadConfigs).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).not.toHaveBeenCalled();
    });

  });


});
