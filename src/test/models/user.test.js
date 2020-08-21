const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');


describe('User', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let User;

  beforeAll(async(done) => {
    crowi = await getInstance();
    User = mongoose.model('User');

    await User.create({
      name: 'Example for User Test',
      username: 'usertest',
      email: 'usertest@example.com',
      password: 'usertestpass',
      lang: 'en_US',
    });

    done();
  });

  describe('Create and Find.', () => {
    describe('The user', () => {
      /* eslint-disable jest/no-test-callback */
      test('should created with createUserByEmailAndPassword', (done) => {
        User.createUserByEmailAndPassword('Example2 for User Test', 'usertest2', 'usertest2@example.com', 'usertest2pass', 'en_US', (err, userData) => {
          expect(err).toBeNull();
          expect(userData).toBeInstanceOf(User);
          expect(userData.name).toBe('Example2 for User Test');
          done();
        });
      });
      /* eslint-enable jest/no-test-callback */

      test('should be found by findUserByUsername', async() => {
        const user = await User.findUserByUsername('usertest');
        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe('Example for User Test');
      });

    });
  });

  describe('User Utilities', () => {
    describe('Get username from path', () => {
      test('found', () => {
        let username = null;
        username = User.getUsernameByPath('/user/sotarok');
        expect(username).toEqual('sotarok');

        username = User.getUsernameByPath('/user/some.user.name12/'); // with slash
        expect(username).toEqual('some.user.name12');
      });

      test('not found', () => {
        let username = null;
        username = User.getUsernameByPath('/the/page/is/not/related/to/user/page');
        expect(username).toBeNull();
      });
    });
  });
});
