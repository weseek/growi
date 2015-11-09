var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , Promise = require('bluebird')
  , utils = require('../utils.js')
  ;
chai.use(sinonChai);

describe('User', function () {
  var Page = utils.models.Page,
    User   = utils.models.User,
    conn   = utils.mongoose.connection;

  describe('Create and Find.', function () {
    context('The user', function() {
      it('should created', function(done) {
        User.createUserByEmailAndPassword('Aoi Miyazaki', 'aoi', 'aoi@example.com', 'hogefuga11', function (err, userData) {
          expect(err).to.be.null;
          expect(userData).to.instanceof(User);
          done();
        });
      });

      it('should be found by findUserByUsername', function(done) {
        User.findUserByUsername('aoi', function (err, userData) {
          expect(err).to.be.null;
          expect(userData).to.instanceof(User);
          done();
        });
      });
    });
  });
});
