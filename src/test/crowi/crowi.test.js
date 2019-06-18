const chai = require('chai');

const { expect } = chai;
const sinonChai = require('sinon-chai');
const helpers = require('@commons/util/helpers');

chai.use(sinonChai);

describe('Test for Crowi application context', () => {
  const Crowi = require('@server/crowi');


  const mongoose = require('mongoose');
  describe('construction', () => {
    it('initialize crowi context', () => {
      const crowi = new Crowi(helpers.root());
      expect(crowi).to.be.instanceof(Crowi);
      expect(crowi.version).to.equal(require('../../../package.json').version);
      expect(crowi.env).to.be.an('Object');
    });

    it('config getter, setter', () => {
      const crowi = new Crowi(helpers.root());
      expect(crowi.getConfig()).to.deep.equals({});
      crowi.setConfig({ test: 1 });
      expect(crowi.getConfig()).to.deep.equals({ test: 1 });
    });

    it('model getter, setter', () => {
      const crowi = new Crowi(helpers.root());
      // set
      crowi.model('hoge', { fuga: 1 });
      expect(crowi.model('hoge')).to.deep.equals({ fuga: 1 });
    });
  });

  // describe('.setupDatabase', () => {
  //   before(() => {
  //     mongoose.disconnect(); // avoid error of Trying to open unclosed connection
  //   });
  //   it('setup completed', (done) => {
  //     const crowi = new Crowi(helpers.root());
  //     // set
  //     const p = crowi.setupDatabase();
  //     expect(p).to.instanceof(Promise);
  //     p
  //       .then(() => {
  //         expect(mongoose.connection.readyState).to.equals(1);
  //         done();
  //       })
  //       .catch((err) => { // eslint-disable-line no-unused-vars
  //         // console.log('readyState', mongoose.connection.readyState);
  //         if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 1) { // alreaady connected
  //           // throught
  //         }
  //         else {
  //           expect(mongoose.connection.readyState).to.equals(0);
  //         }
  //         done();
  //       });
  //   });
  // });
});
