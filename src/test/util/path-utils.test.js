const chai = require('chai')
  , expect = chai.expect
  , sinonChai = require('sinon-chai')
  ;
chai.use(sinonChai);

const pathUtils = require('@commons/util/path-utils');

describe('page-utils', () => {

  describe('.normalizePath', () => {
    it('should add heading slash', done => {
      expect(pathUtils.normalizePath('hoge/fuga')).to.equal('/hoge/fuga');
      done();
    });

    it('should remove trailing slash', done => {
      expect(pathUtils.normalizePath('/hoge/fuga/')).to.equal('/hoge/fuga');
      done();
    });

    it('should remove unnecessary slashes', done => {
      expect(pathUtils.normalizePath('//hoge/fuga//')).to.equal('/hoge/fuga');
      done();
    });
  });
});
