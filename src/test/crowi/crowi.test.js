const chai = require('chai')
  , expect = chai.expect
  , sinonChai = require('sinon-chai')

  , helpers = require('@commons/util/helpers')
  ;
chai.use(sinonChai);

describe('Test for Crowi application context', function() {
  const Crowi = require('@server/crowi')
    , mongoose = require('mongoose')
    ;

  describe('construction', function() {
    it('initialize crowi context', function() {
      const crowi = new Crowi(helpers.root(), process.env);
      expect(crowi).to.be.instanceof(Crowi);
      expect(crowi.version).to.equal(require('../../../package.json').version);
      expect(crowi.env).to.be.an('Object');
    });

    it('config getter, setter', function() {
      const crowi = new Crowi(helpers.root(), process.env);
      expect(crowi.getConfig()).to.deep.equals({});
      crowi.setConfig({test: 1});
      expect(crowi.getConfig()).to.deep.equals({test: 1});
    });

    it('model getter, setter', function() {
      const crowi = new Crowi(helpers.root(), process.env);
      // set
      crowi.model('hoge', { fuga: 1 });
      expect(crowi.model('hoge')).to.deep.equals({ fuga: 1 });
    });
  });

  describe('.setupDatabase', function() {
    before(function() {
      mongoose.disconnect(); // avoid error of Trying to open unclosed connection
    });
    it('setup completed', function(done) {
      const crowi = new Crowi(helpers.root(), process.env);
      // set
      const p = crowi.setupDatabase()
      expect(p).to.instanceof(Promise);
      p.then(function() {
        expect(mongoose.connection.readyState).to.equals(1);
        done();
      }).catch(function(err) {
        //console.log('readyState', mongoose.connection.readyState);
        if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 1) { // alreaady connected
          // throught
        } else {
          expect(mongoose.connection.readyState).to.equals(0);
        }
        done();
      });
    });
  });
});
