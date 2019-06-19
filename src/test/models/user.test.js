const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');


describe('User', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let User;

  beforeAll(async(done) => {
    crowi = await getInstance();
    done();
  });

  beforeEach(async(done) => {
    User = mongoose.model('User');
    done();
  });

  describe('Create and Find.', () => {
    describe('The user', () => {
      test('should created', (done) => {
        User.createUserByEmailAndPassword('Aoi Miyazaki', 'aoi', 'aoi@example.com', 'hogefuga11', 'en', (err, userData) => {
          expect(err).toBeNull();
          expect(userData).toBeInstanceOf(User);
          done();
        });
      });

      test('should be found by findUserByUsername', (done) => {
        User.findUserByUsername('aoi')
          .then((userData) => {
            expect(userData).toBeInstanceOf(User);
            done();
          });
      });

      test('should be found by findUsersByPartOfEmail', (done) => {
        User.findUsersByPartOfEmail('ao', {})
          .then((userData) => {
            expect(userData).toBeInstanceOf(Array);
            expect(userData[0]).toBeInstanceOf(User);
            expect(userData[0].email).toEqual('aoi@example.com');
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
        expect(username).toEqual('sotarok');

        username = User.getUsernameByPath('/user/some.user.name12/'); // with slash
        expect(username).toEqual('some.user.name12');

        done();
      });

      test('not found', (done) => {
        let username = null;
        username = User.getUsernameByPath('/the/page/is/not/related/to/user/page');
        expect(username).toBeNull();

        done();
      });
    });
  });
});
