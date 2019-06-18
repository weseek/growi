const chai = require('chai');
const sinonChai = require('sinon-chai');
const utils = require('../utils.js');

const expect = chai.expect;
chai.use(sinonChai);

describe('User', () => {
  const User = utils.models.User;
  const conn = utils.mongoose.connection;

  // clear collection
  beforeAll((done) => {
    conn.collection('users').remove()
      .then(() => {
        done();
      });
  });

  describe('Create and Find.', () => {
    describe('The user', () => {
      test('should created', (done) => {
        User.createUserByEmailAndPassword('Aoi Miyazaki', 'aoi', 'aoi@example.com', 'hogefuga11', 'en', (err, userData) => {
          expect(err).to.be.null;
          expect(userData).to.instanceof(User);
          done();
        });
      });

      test('should be found by findUserByUsername', (done) => {
        User.findUserByUsername('aoi')
          .then((userData) => {
            expect(userData).to.instanceof(User);
            done();
          });
      });

      test('should be found by findUsersByPartOfEmail', (done) => {
        User.findUsersByPartOfEmail('ao', {})
          .then((userData) => {
            expect(userData).to.instanceof(Array);
            expect(userData[0]).to.instanceof(User);
            expect(userData[0].email).to.equal('aoi@example.com');
            done();
          });
      });
    });
  });

  describe('User Utilities', () => {
    describe('Get username from path', () => {
      test('found', (done) => {
        let username = null;
        username = User.getUsernameByPath('/user/sotarok');
        expect(username).to.equal('sotarok');

        username = User.getUsernameByPath('/user/some.user.name12/'); // with slash
        expect(username).to.equal('some.user.name12');

        done();
      });

      test('not found', (done) => {
        let username = null;
        username = User.getUsernameByPath('/the/page/is/not/related/to/user/page');
        expect(username).to.be.null;

        done();
      });
    });
  });
});
