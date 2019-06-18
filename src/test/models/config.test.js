const utils = require('../utils.js');

/* global testDBUtil */

describe('Config model test', () => {
  // const conn = utils.mongoose.connection;
  // const Config = utils.models.Config;

  beforeAll((done) => {

    const fixture = [
      { ns: 'crowi', key: 'test:test', value: JSON.stringify('crowi test value') },
      { ns: 'crowi', key: 'test:test2', value: JSON.stringify(11111) },
      { ns: 'crowi', key: 'test:test3', value: JSON.stringify([1, 2, 3, 4, 5]) },
      { ns: 'plugin', key: 'other:config', value: JSON.stringify('this is data') },
    ];

    done();

    // testDBUtil.generateFixture(conn, 'Config', fixture)
    //   .then((configs) => {
    //     done();
    //   })
    //   .catch(() => {
    //     done(new Error('Skip this test.'));
    //   });
  });

  describe('.CONSTANTS', () => {
    test('Config has constants', () => {
      expect('hoge').toBe('Open');
      // expect(Config.SECURITY_REGISTRATION_MODE_OPEN).toBe('Open');
      // expect(Config.SECURITY_REGISTRATION_MODE_RESTRICTED).toBe('Resricted');
      // expect(Config.SECURITY_REGISTRATION_MODE_CLOSED).toBe('Closed');
    });
  });

  // describe('.loadAllConfig', () => {
  //   test('Get config array', (done) => {
  //     const Config = mongoose.model('Config');

  //     Config.loadAllConfig((err, config) => {
  //       expect(config.crowi).toBeInstanceOf(Object);
  //       expect(config.crowi).toHaveProperty('test:test', 'crowi test value');
  //       expect(config.crowi).toHaveProperty('test:test2', 11111);
  //       expect(config.crowi).toHaveProperty('test:test3', [1, 2, 3, 4, 5]);

  //       expect(config.plugin).toBeInstanceOf(Object);
  //       expect(config.plugin).toHaveProperty('other:config', 'this is data');

  //       done();
  //     });
  //   });
  // });
});
