const chai = require('chai');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
const utils = require('../utils.js');

chai.use(sinonChai);

describe('UpdatePost', () => {
  const UpdatePost = utils.models.UpdatePost;

  describe('.createPrefixesByPathPattern', () => {
    describe('with a path', () => {
      test('should return right patternPrfixes', (done) => {
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

  describe('.getRegExpByPattern', () => {
    describe('with a pattern', () => {
      test('should return right regexp', (done) => {
        expect(UpdatePost.getRegExpByPattern('/*')).to.deep.equal(/^\/.*/);
        expect(UpdatePost.getRegExpByPattern('/user/*/日報*')).to.deep.equal(/^\/user\/.*\/日報.*/);
        expect(UpdatePost.getRegExpByPattern('/project/hoge/*')).to.deep.equal(/^\/project\/hoge\/.*/);
        expect(UpdatePost.getRegExpByPattern('/*/MTG/*')).to.deep.equal(/^\/.*\/MTG\/.*/);
        expect(UpdatePost.getRegExpByPattern('自己紹介')).to.deep.equal(/^\/.*自己紹介.*/);
        expect(UpdatePost.getRegExpByPattern('/user/aoi/メモ/2016/02/10/xxx')).to.deep.equal(/^\/user\/aoi\/メモ\/2016\/02\/10\/xxx/);
        done();
      });
    });
  });

  describe('.normalizeChannelName', () => {
    describe('with a channel name', () => {
      test('should return true', (done) => {
        expect(UpdatePost.normalizeChannelName('#pj-hoge')).to.be.equal('pj-hoge');
        expect(UpdatePost.normalizeChannelName('pj-hoge')).to.be.equal('pj-hoge');

        done();
      });
    });
  });
});
