var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , proxyquire = require('proxyquire')
  ;
chai.use(sinonChai);

describe('Page', function () {
  var conn
    , crowi = new (require(ROOT_DIR + '/lib/crowi'))(ROOT_DIR, process.env)
    , Page = proxyquire(MODEL_DIR + '/page.js', {mongoose: mongoose})(crowi)
    , User = proxyquire(MODEL_DIR + '/user.js', {mongoose: mongoose})(crowi)
    ;

  if (!mongoUri) {
    return;
  }

  before(function (done) {
    conn = mongoose.createConnection(mongoUri, function(err) {
      if (err) {
        done();
      }

      Page = conn.model('Page');
      User = conn.model('User');

      var fixture = [
        {
          path: '/user/anonymous/memo',
          grant: Page.GRANT_RESTRICTED,
          grantedUsers: []
        },
        {
          path: '/grant/public',
          grant: Page.GRANT_PUBLIC
        },
        {
          path: '/grant/restricted',
          grant: Page.GRANT_RESTRICTED
        },
        {
          path: '/grant/specified',
          grant: Page.GRANT_SPECIFIED
        },
        {
          path: '/grant/owner',
          grant: Page.GRANT_OWNER
        }
      ];
      var userFixture = [
        {userId: 'anonymous', email: 'anonymous@gmail.com'}
      ];

      testDBUtil.generateFixture(conn, 'Page', fixture, function() {});
      testDBUtil.generateFixture(conn, 'User', userFixture, done);
    });
  });

  after(function (done) {
    return testDBUtil.cleanUpDb(conn, 'Page', function(err, doc) {
      return conn.close(done);
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

  describe('.isGrantedFor', function() {
    context('with a granted user', function() {
      it('should return true', function(done) {
        User.find({userId: 'anonymous'}, function(err, user) {
          if (err) { done(err); }

          Page.findOne({path: '/user/anonymous/memo'}, function(err, page) {
            if (err) { done(err); }

            page.grantedUsers.push(user.id);

            page.save(function(err, newPage) {
              if (err) { done(err); }

              expect(newPage.isGrantedFor(user)).to.be.equal(true);
              done();
            });
          });
        });
      });
    });

    context('with a public page', function() {
      it('should return true', function(done) {
        User.find({userId: 'anonymous'}, function(err, user) {
          if (err) { done(err); }

          Page.findOne({path: '/user/anonymous/memo'}, function(err, page) {
            if (err) { done(err); }

            expect(page.isGrantedFor(user)).to.be.equal(true);
            done();
          });
        });
      });
    });

    context('with a restricted page and an user who has no grant', function() {
      it('should return false', function(done) {
        User.find({userId: 'anonymous'}, function(err, user) {
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
});
