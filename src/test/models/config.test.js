var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , utils = require('../utils.js')
  ;
chai.use(sinonChai);

describe('Config model test', function () {
  var Page = utils.models.Page,
    Config = utils.models.Config,
    User   = utils.models.User,
    conn = utils.mongoose.connection;

  before(function (done) {
    var fixture = [
      {ns: 'crowi', key: 'test:test', value: JSON.stringify('crowi test value')},
      {ns: 'crowi', key: 'test:test2', value: JSON.stringify(11111)},
      {ns: 'crowi', key: 'test:test3', value: JSON.stringify([1, 2, 3, 4, 5])},
      {ns: 'plugin', key: 'other:config', value: JSON.stringify('this is data')},
    ];

    testDBUtil.generateFixture(conn, 'Config', fixture)
    .then(function(configs) {
      done();
    }).catch(function() {
      done(new Error('Skip this test.'));
    });
  });

  describe('.CONSTANTS', function () {
    it('Config has constants', function() {
      expect(Config.SECURITY_REGISTRATION_MODE_OPEN).to.have.string('Open');
      expect(Config.SECURITY_REGISTRATION_MODE_RESTRICTED).to.have.string('Resricted');
      expect(Config.SECURITY_REGISTRATION_MODE_CLOSED).to.have.string('Closed');
    });
  });

  describe('.loadAllConfig', function () {
    it('Get config array', function(done) {
      Config.loadAllConfig(function(err, config) {

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

