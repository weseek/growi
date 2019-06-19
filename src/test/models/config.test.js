const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

describe('Config model test', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let Config;

  beforeAll(async(done) => {
    crowi = await getInstance();
    done();
  });

  beforeEach(async(done) => {
    Config = mongoose.model('Config');
    done();
  });

  describe('.CONSTANTS', () => {
    test('Config has constants', async() => {
      expect(Config.SECURITY_REGISTRATION_MODE_OPEN).toBe('Open');
      expect(Config.SECURITY_REGISTRATION_MODE_RESTRICTED).toBe('Resricted');
      expect(Config.SECURITY_REGISTRATION_MODE_CLOSED).toBe('Closed');
    });
  });

});
