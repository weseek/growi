describe('config/migrate-mongo-config.js', () => {

  beforeEach(async() => {
    jest.resetModules();
  });

  test('throws an error when MIGRATIONS_DIR is not set', () => {

    const initMongooseGlobalSettingsMock = jest.fn();

    // mock for mongoose-utils
    jest.doMock('../../src/server/util/mongoose-utils', () => {
      return {
        initMongooseGlobalSettings: initMongooseGlobalSettingsMock,
      };
    });

    const requireConfig = () => {
      require('./migrate-mongo-config');
    };

    expect(requireConfig).toThrow('An env var MIGRATIONS_DIR must be set.');

    jest.dontMock('../../src/server/util/mongoose-utils');

    expect(initMongooseGlobalSettingsMock).not.toHaveBeenCalled();
  });

  /* eslint-disable indent */
  describe.each`
    MONGO_URI                                         | expectedDbName
    ${'mongodb://example.com/growi'}                  | ${'growi'}
    ${'mongodb://user:pass@example.com/growi'}        | ${'growi'}
    ${'mongodb://example.com/growi?replicaSet=mySet'} | ${'growi'}
  `('returns', ({ MONGO_URI, expectedDbName }) => {

    beforeEach(async() => {
      process.env.MIGRATIONS_DIR = 'testdir/migrations';
    });

    test(`when 'MONGO_URI' is '${MONGO_URI}`, () => {

      const initMongooseGlobalSettingsMock = jest.fn();
      const mongoOptionsMock = jest.fn();

      // mock for mongoose-utils
      jest.doMock('../../src/server/util/mongoose-utils', () => {
        return {
          initMongooseGlobalSettings: initMongooseGlobalSettingsMock,
          getMongoUri: () => {
            return MONGO_URI;
          },
          mongoOptions: mongoOptionsMock,
        };
      });

      const { mongodb, migrationsDir, changelogCollectionName } = require('./migrate-mongo-config');

      jest.dontMock('../../src/server/util/mongoose-utils');

      expect(initMongooseGlobalSettingsMock).toHaveBeenCalledTimes(1);
      expect(mongodb.url).toBe(MONGO_URI);
      expect(mongodb.databaseName).toBe(expectedDbName);
      expect(mongodb.options).toBe(mongoOptionsMock);
      expect(migrationsDir).toBe('testdir/migrations');
      expect(changelogCollectionName).toBe('migrations');
    });
  });
  /* eslint-enable indent */

});
