const { getInstance } = require('../setup-crowi');

describe('ConfigManager test', () => {
  let crowi;
  let configManager;

  beforeEach(async(done) => {
    crowi = await getInstance();
    configManager = crowi.configManager;
    done();
  });


  describe('updateConfigsInTheSameNamespace()', () => {

    const configLoaderMock = {};
    const configModelMock = {};

    beforeEach(async(done) => {
      configManager.configPubsub = {};

      // prepare mocks for loadConfigs method
      configManager.configLoader = configLoaderMock;

      // prepare mocks for updateConfigsInTheSameNamespace method
      configManager.configModel = configModelMock;

      done();
    });

    test('invoke publishUpdateMessage() after loadConfigs() with correct updatedAt arg', async() => {
      // define sleep function
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

      // replace methods with mock
      configLoaderMock.load = jest.fn(async() => {
        await sleep(500);
      });
      configManager.reloadConfigKeys = jest.fn();
      configModelMock.bulkWrite = jest.fn();

      let publishedUpdatedDate;
      configManager.publishUpdateMessage = jest.fn((date) => {
        publishedUpdatedDate = date;
      });

      expect(configManager.lastLoadedAt < new Date()).toBeTruthy();

      const dummyConfig = { dummyKey: 'dummyValue' };
      await configManager.updateConfigsInTheSameNamespace('dummyNs', dummyConfig);

      expect(configModelMock.bulkWrite).toHaveBeenCalledTimes(1);
      expect(configManager.publishUpdateMessage).toHaveBeenCalledTimes(1);
      expect(configLoaderMock.load).toHaveBeenCalledTimes(1);
      expect(configManager.reloadConfigKeys).toHaveBeenCalledTimes(1);
      expect(configManager.lastLoadedAt.getTime() - publishedUpdatedDate.getTime() >= 500).toBeTruthy();
    });

  });


});
