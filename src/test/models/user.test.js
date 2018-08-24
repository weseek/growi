var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , utils = require('../utils.js')
  ;
chai.use(sinonChai);

describe('User', function () {
  var Page = utils.models.Page,
    User   = utils.models.User,
    conn   = utils.mongoose.connection;

  // clear collection
  before(done => {
    conn.collection('users').remove()
      .then(() => {
        done();
      });
  });

  describe('Create and Find.', function () {
    context('The user', function() {
      it('should created', function(done) {
        User.createUserByEmailAndPassword('Aoi Miyazaki', 'aoi', 'aoi@example.com', 'hogefuga11', 'en', function (err, userData) {
          expect(err).to.be.null;
          expect(userData).to.instanceof(User);
          done();
        });
      });

      it('should be found by findUserByUsername', function(done) {
        User.findUserByUsername('aoi')
        .then(function(userData) {
          expect(userData).to.instanceof(User);
          done();
        });
      });

      it('should be found by findUsersByPartOfEmail', function(done) {

        User.findUsersByPartOfEmail('ao', {})
        .then(function(userData) {
          expect(userData).to.instanceof(Array);
          expect(userData[0]).to.instanceof(User);
          expect(userData[0].email).to.equal('aoi@example.com');
          done();
        });

      });
    });
  });

  describe('User Utilities', function () {
    context('Get username from path', function() {
      it('found', function(done) {
        var username = null;
        username = User.getUsernameByPath('/user/sotarok');
        expect(username).to.equal('sotarok');

        username = User.getUsernameByPath('/user/some.user.name12/'); // with slash
        expect(username).to.equal('some.user.name12');

        done();
      });

      it('not found', function(done) {
        var username = null;
        username = User.getUsernameByPath('/the/page/is/not/related/to/user/page');
        expect(username).to.be.null;

        done();
      });
    });
  });
});
