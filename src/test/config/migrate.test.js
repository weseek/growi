describe('config/migrate.js', () => {

  beforeEach(async(done) => {
    jest.resetModules();
    done();
  });

  /* eslint-disable indent */
  describe.each`
    MONGO_URI                                         | expectedUrl                                       | expectedDbName
    ${'mongodb://example.com/growi'}                  | ${'mongodb://example.com/growi'}                  | ${'growi'}
    ${'mongodb://user:pass@example.com/growi'}        | ${'mongodb://user:pass@example.com/growi'}        | ${'growi'}
    ${'mongodb://example.com/growi?replicaSet=mySet'} | ${'mongodb://example.com/growi?replicaSet=mySet'} | ${'growi'}
  `('returns', ({ MONGO_URI, expectedUrl, expectedDbName }) => {
    test(`when 'MONGO_URI' is '${MONGO_URI}`, () => {

      // mock for mongoose-utils
      jest.doMock('~/utils/mongoose-utils', () => {
        return {
          getMongoUri: () => {
            return MONGO_URI;
          },
        };
      });

      const { mongoUri, mongodb } = require('^/config/migrate');

      jest.dontMock('~/utils/mongoose-utils');

      expect(mongoUri).toBe(MONGO_URI);
      expect(mongodb.url).toBe(expectedUrl);
      expect(mongodb.databaseName).toBe(expectedDbName);
    });
  });
  /* eslint-enable indent */

});
