var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
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

      return testDBUtil.generateFixture(conn, 'Page', fixture)
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

  describe('.getDeletedPageName', function() {
    it('should return trash page name', function() {
      expect(Page.getDeletedPageName('/hoge')).to.be.equal('/trash/hoge');
      expect(Page.getDeletedPageName('hoge')).to.be.equal('/trash/hoge');
    });
  });
  describe('.getRevertDeletedPageName', function() {
    it('should return reverted trash page name', function() {
      expect(Page.getRevertDeletedPageName('/hoge')).to.be.equal('/hoge');
      expect(Page.getRevertDeletedPageName('/trash/hoge')).to.be.equal('/hoge');
      expect(Page.getRevertDeletedPageName('/trash/hoge/trash')).to.be.equal('/hoge/trash');
    });
  });

  describe('.isDeletableName', function() {
    it('should decide deletable or not', function() {
      expect(Page.isDeletableName('/hoge')).to.be.true;
      expect(Page.isDeletableName('/user/xxx')).to.be.false;
      expect(Page.isDeletableName('/user/xxx123')).to.be.false;
      expect(Page.isDeletableName('/user/xxx/')).to.be.true;
      expect(Page.isDeletableName('/user/xxx/hoge')).to.be.true;
    });
  });

  describe('.isCreatableName', function() {
    it('should decide creatable or not', function() {
      expect(Page.isCreatableName('/hoge')).to.be.true;

      // edge cases
      expect(Page.isCreatableName('/me')).to.be.false;
      expect(Page.isCreatableName('/me/')).to.be.false;
      expect(Page.isCreatableName('/me/x')).to.be.false;
      expect(Page.isCreatableName('/meeting')).to.be.true;
      expect(Page.isCreatableName('/meeting/x')).to.be.true;

      // end with "edit"
      expect(Page.isCreatableName('/meeting/edit')).to.be.false;

      // under score
      expect(Page.isCreatableName('/_')).to.be.false;
      expect(Page.isCreatableName('/_r/x')).to.be.false;
      expect(Page.isCreatableName('/_api')).to.be.false;
      expect(Page.isCreatableName('/_apix')).to.be.false;
      expect(Page.isCreatableName('/_api/x')).to.be.false;

      expect(Page.isCreatableName('/hoge/xx.md')).to.be.false;

      // start with https?
      expect(Page.isCreatableName('/http://demo.crowi.wiki/user/sotarok/hoge')).to.be.false;
      expect(Page.isCreatableName('/https://demo.crowi.wiki/user/sotarok/hoge')).to.be.false;
      expect(Page.isCreatableName('http://demo.crowi.wiki/user/sotarok/hoge')).to.be.false;
      expect(Page.isCreatableName('https://demo.crowi.wiki/user/sotarok/hoge')).to.be.false;


      var forbidden = ['installer', 'register', 'login', 'logout', 'admin', 'files', 'trash', 'paste', 'comments'];
      for (var i = 0; i < forbidden.length ; i++) {
        var pn = forbidden[i];
        expect(Page.isCreatableName('/' + pn + '')).to.be.false;
        expect(Page.isCreatableName('/' + pn + '/')).to.be.false;
        expect(Page.isCreatableName('/' + pn + '/abc')).to.be.false;
      }

      var forbidden = ['bookmarks', 'comments', 'activities', 'pages', 'recent-create', 'recent-edit'];
      for (var i = 0; i < forbidden.length ; i++) {
        var pn = forbidden[i];
        expect(Page.isCreatableName('/user/aoi/' + pn)).to.be.false;
        expect(Page.isCreatableName('/user/aoi/x/' + pn)).to.be.true;
      }
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
