var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , utils = require('../utils.js')
  ;
chai.use(sinonChai);

describe('UpdatePost', function () {
  var UpdatePost = utils.models.UpdatePost,
    conn   = utils.mongoose.connection;

  describe('.createPrefixesByPathPattern', function () {
    context('with a path', function() {
      it('should return right patternPrfixes', function(done) {
        expect(UpdatePost.createPrefixesByPathPattern('/*')).to.deep.equal(['*', '*']);
        expect(UpdatePost.createPrefixesByPathPattern('/user/*/日報*')).to.deep.equal(['user', '*']);
        expect(UpdatePost.createPrefixesByPathPattern('/project/hoge/*')).to.deep.equal(['project', 'hoge']);
        expect(UpdatePost.createPrefixesByPathPattern('/*/MTG/*')).to.deep.equal(['*', 'MTG']);
        expect(UpdatePost.createPrefixesByPathPattern('自己紹介')).to.deep.equal(['*', '*']);
        expect(UpdatePost.createPrefixesByPathPattern('/user/aoi/メモ/2016/02/10/xxx')).to.deep.equal(['user', 'aoi']);

        done();
      });
    });
  });

  describe('.getRegExpByPattern', function () {
    context('with a pattern', function() {
      it('should return right regexp', function(done) {
        expect(UpdatePost.getRegExpByPattern('/*')).to.deep.equal(/^\/.*/);
        expect(UpdatePost.getRegExpByPattern('/user/*/日報*')).to.deep.equal(/^\/user\/.*\/日報.*/);
        expect(UpdatePost.getRegExpByPattern('/project/hoge/*')).to.deep.equal(/^\/project\/hoge\/.*/);
        expect(UpdatePost.getRegExpByPattern('/*/MTG/*')).to.deep.equal(/^\/.*\/MTG\/.*/);
        expect(UpdatePost.getRegExpByPattern('自己紹介')).to.deep.equal(/^\/.*自己紹介.*/);
        expect(UpdatePost.getRegExpByPattern('\/user\/aoi\/メモ\/2016\/02\/10\/xxx')).to.deep.equal(/^\/user\/aoi\/メモ\/2016\/02\/10\/xxx/);
        done();
      });
    });
  });

  describe('.normalizeChannelName', function () {
    context('with a channel name', function() {
      it('should return true', function(done) {
        expect(UpdatePost.normalizeChannelName('#pj-hoge')).to.be.equal('pj-hoge');
        expect(UpdatePost.normalizeChannelName('pj-hoge')).to.be.equal('pj-hoge');

        done();
      });
    });
  });
});

