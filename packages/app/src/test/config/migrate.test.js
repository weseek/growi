describe('config/migrate.js', () => {

  beforeEach(async() => {
    jest.resetModules();
  });

  /* eslint-disable indent */
  describe.each`
    MONGO_URI                                         | expectedUrl                                       | expectedDbName
    ${'mongodb://example.com/growi'}                  | ${'mongodb://example.com/growi'}                  | ${'growi'}
    ${'mongodb://user:pass@example.com/growi'}        | ${'mongodb://user:pass@example.com/growi'}        | ${'growi'}
    ${'mongodb://example.com/growi?replicaSet=mySet'} | ${'mongodb://example.com/growi?replicaSet=mySet'} | ${'growi'}
  `('returns', ({ MONGO_URI, expectedUrl, expectedDbName }) => {
    test(`when 'MONGO_URI' is '${MONGO_URI}`, () => {

      const initMongooseGlobalSettingsMock = jest.fn();

      // mock for mongoose-utils
      jest.doMock('~/server/util/mongoose-utils', () => {
        return {
          initMongooseGlobalSettings: initMongooseGlobalSettingsMock,
          getMongoUri: () => {
            return MONGO_URI;
          },
        };
      });

      const { mongoUri, mongodb } = require('^/config/migrate');

      jest.dontMock('~/server/util/mongoose-utils');

      expect(initMongooseGlobalSettingsMock).toHaveBeenCalledTimes(1);
      expect(mongoUri).toBe(MONGO_URI);
      expect(mongodb.url).toBe(expectedUrl);
      expect(mongodb.databaseName).toBe(expectedDbName);
    });
  });
  /* eslint-enable indent */

});
