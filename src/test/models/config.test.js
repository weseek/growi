const chai = require('chai');
const sinonChai = require('sinon-chai');
const utils = require('../utils.js');

const { expect } = chai;

chai.use(sinonChai);

/* global testDBUtil */


describe('Config model test', () => {
  const Config = utils.models.Config;

  const conn = utils.mongoose.connection;

  before((done) => {
    const fixture = [
      { ns: 'crowi', key: 'test:test', value: JSON.stringify('crowi test value') },
      { ns: 'crowi', key: 'test:test2', value: JSON.stringify(11111) },
      { ns: 'crowi', key: 'test:test3', value: JSON.stringify([1, 2, 3, 4, 5]) },
      { ns: 'plugin', key: 'other:config', value: JSON.stringify('this is data') },
    ];

    testDBUtil.generateFixture(conn, 'Config', fixture)
      .then((configs) => {  // eslint-disable-line
        done();
      }).catch(() => {
        done(new Error('Skip this test.'));
      });
  });

  describe('.CONSTANTS', () => {
    it('Config has constants', () => {
      expect(Config.SECURITY_REGISTRATION_MODE_OPEN).to.have.string('Open');
      expect(Config.SECURITY_REGISTRATION_MODE_RESTRICTED).to.have.string('Resricted');
      expect(Config.SECURITY_REGISTRATION_MODE_CLOSED).to.have.string('Closed');
    });
  });

  describe('.loadAllConfig', () => {
    it('Get config array', (done) => {
      Config.loadAllConfig((err, config) => {
        expect(config.crowi).to.be.an('Object');
        expect(config.crowi).to.have.property('test:test')
          .and.equal('crowi test value');
        expect(config.crowi).to.have.property('test:test2')
          .and.equal(11111);
        expect(config.crowi).to.have.property('test:test3')
          .and.to.be.instanceof(Array)
          .and.deep.equal([1, 2, 3, 4, 5]);

        expect(config.plugin).to.be.an('Object')
          .and.have.property('other:config')
          .and.equal('this is data');

        done();
      });
    });
  });
});
