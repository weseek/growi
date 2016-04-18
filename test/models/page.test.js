var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , Promise = require('bluebird')
  , utils = require('../utils.js')
  ;
chai.use(sinonChai);

describe('Page', function () {
  var Page = utils.models.Page,
    User   = utils.models.User,
    conn   = utils.mongoose.connection;

  before(function (done) {
    Promise.resolve().then(function() {
      var userFixture = [
        {name: 'Anon 0', username: 'anonymous0', email: 'anonymous0@example.com'},
        {name: 'Anon 1', username: 'anonymous1', email: 'anonymous1@example.com'}
      ];

      return testDBUtil.generateFixture(conn, 'User', userFixture);
    }).then(function(testUsers) {
      var testUser0 = testUsers[0];

      var fixture = [
        {
          path: '/user/anonymous/memo',
          grant: Page.GRANT_RESTRICTED,
          grantedUsers: [testUser0],
          creator: testUser0
        },
        {
          path: '/grant/public',
          grant: Page.GRANT_PUBLIC,
          grantedUsers: [testUser0],
          creator: testUser0
        },
        {
          path: '/grant/restricted',
          grant: Page.GRANT_RESTRICTED,
          grantedUsers: [testUser0],
          creator: testUser0
        },
        {
          path: '/grant/specified',
          grant: Page.GRANT_SPECIFIED,
          grantedUsers: [testUser0],
          creator: testUser0
        },
        {
          path: '/grant/owner',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser0],
          creator: testUser0,
        },
        {
          path: '/page/for/extended',
          grant: Page.GRANT_PUBLIC,
          creator: testUser0,
          extended: {hoge: 1}
        },
      ];

      testDBUtil.generateFixture(conn, 'Page', fixture)
      .then(function(pages) {
        done();
      });
    });
  });

  describe('.isPublic', function () {
    context('with a public page', function() {
      it('should return true', function(done) {
        Page.findOne({path: '/grant/public'}, function(err, page) {
          expect(err).to.be.null;
          expect(page.isPublic()).to.be.equal(true);
          done();
        });
      });
    });

    ['restricted', 'specified', 'owner'].forEach(function(grant) {
      context('with a ' + grant + ' page', function() {
        it('should return false', function(done) {
          Page.findOne({path: '/grant/' + grant}, function(err, page) {
            expect(err).to.be.null;
            expect(page.isPublic()).to.be.equal(false);
            done();
          });
        });
      });
    });
  });

  describe('.isCreator', function() {
    context('with creator', function() {
      it('should return true', function(done) {
        User.findOne({email: 'anonymous0@example.com'}, function(err, user) {
          if (err) { done(err); }

          Page.findOne({path: '/user/anonymous/memo'}, function(err, page) {
            expect(page.isCreator(user)).to.be.equal(true);
            done();
          })
        });
      });
    });

    context('with non-creator', function() {
      it('should return false', function(done) {
        User.findOne({email: 'anonymous1@example.com'}, function(err, user) {
          if (err) { done(err); }

          Page.findOne({path: '/user/anonymous/memo'}, function(err, page) {
            expect(page.isCreator(user)).to.be.equal(false);
            done();
          })
        });
      });
    });
  });

  describe('.isGrantedFor', function() {
    context('with a granted user', function() {
      it('should return true', function(done) {
        User.findOne({email: 'anonymous0@example.com'}, function(err, user) {
          if (err) { done(err); }

          Page.findOne({path: '/user/anonymous/memo'}, function(err, page) {
            if (err) { done(err); }

            expect(page.isGrantedFor(user)).to.be.equal(true);
            done();
          });
        });
      });
    });

    context('with a public page', function() {
      it('should return true', function(done) {
        User.findOne({email: 'anonymous1@example.com'}, function(err, user) {
          if (err) { done(err); }

          Page.findOne({path: '/grant/public'}, function(err, page) {
            if (err) { done(err); }

            expect(page.isGrantedFor(user)).to.be.equal(true);
            done();
          });
        });
      });
    });

    context('with a restricted page and an user who has no grant', function() {
      it('should return false', function(done) {
        User.findOne({email: 'anonymous1@example.com'}, function(err, user) {
          if (err) { done(err); }

          Page.findOne({path: '/grant/restricted'}, function(err, page) {
            if (err) { done(err); }

            expect(page.isGrantedFor(user)).to.be.equal(false);
            done();
          });
        });
      });
    });
  });

  describe('Extended field', function () {
    context('Slack Channel.', function() {
      it('should be empty', function(done) {
        Page.findOne({path: '/page/for/extended'}, function(err, page) {
          expect(page.extended.hoge).to.be.equal(1);
          expect(page.getSlackChannel()).to.be.equal('');
          done();
        })
      });

      it('set slack channel and should get it and should keep hoge ', function(done) {
        Page.findOne({path: '/page/for/extended'}, function(err, page) {
          page.updateSlackChannel('slack-channel1')
          .then(function(data) {
            Page.findOne({path: '/page/for/extended'}, function(err, page) {
              expect(page.extended.hoge).to.be.equal(1);
              expect(page.getSlackChannel()).to.be.equal('slack-channel1');
              done();
            });
          })
        });
      });

    });
  });

});
