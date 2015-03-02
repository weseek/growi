var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , proxyquire = require('proxyquire')

  , path = require('path')
  , Promise = require('bluebird')
  ;
chai.use(sinonChai);

describe('Test for Crowi application context', function () {
  var Crowi = require('../../lib/crowi')
    , mongoose = require('mongoose')
    ;

  describe('construction', function() {
    it('initialize crowi context', function() {
      var crowi = new Crowi(path.normalize(__dirname + '/../../'), process.env);
      expect(crowi).to.be.instanceof(Crowi);
      expect(crowi.version).to.equal(require('../../package.json').version);
      expect(crowi.env).to.be.an('Object');
    });

    it('config getter, setter', function() {
      var crowi = new Crowi(path.normalize(__dirname + '/../../'), process.env);
      expect(crowi.getConfig()).to.deep.equals({});
      crowi.setConfig({test: 1});
      expect(crowi.getConfig()).to.deep.equals({test: 1});
    });

    it('model getter, setter', function() {
      var crowi = new Crowi(path.normalize(__dirname + '/../../'), process.env);
      // set
      crowi.model('hoge', { fuga: 1 });
      expect(crowi.model('hoge')).to.deep.equals({ fuga: 1 });
    });
  });

  describe('.setupDatabase', function() {
    it('setup completed', function(done) {
      var crowi = new Crowi(path.normalize(__dirname + '/../../'), process.env);
      // set
      var p = crowi.setupDatabase()
      expect(p).to.instanceof(Promise);
      if (mongoUri) {
        p.then(function() {
          expect(mongoose.connection.readyState).to.equals(1);
          done();
        });
      } else {
        p.catch(function() {
          expect(mongoose.connection.readyState).to.equals(1);
          done();
        });
      }
    });
  });
});
