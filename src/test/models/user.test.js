const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');


describe('User', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let User;

  beforeAll(async(done) => {
    crowi = await getInstance();
    User = mongoose.model('User');

    // remove all
    await Promise.all([
      User.remove({}),
    ]);

    await User.create({
      name: 'Example for User Test',
      username: 'usertest',
      email: 'usertest@example.com',
      password: 'usertestpass',
      lang: 'en',
    });

    done();
  });

  describe('Create and Find.', () => {
    describe('The user', () => {
      test('should created with createUserByEmailAndPassword', (done) => {
        User.createUserByEmailAndPassword('Example2 for User Test', 'usertest2', 'usertest2@example.com', 'usertest2pass', 'en', (err, userData) => {
          expect(err).toBeNull();
          expect(userData).toBeInstanceOf(User);
          expect(userData.name).toBe('Example2 for User Test');
          done();
        });
      });

      test('should be found by findUserByUsername', async() => {
        const user = await User.findUserByUsername('usertest');
        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe('Example for User Test');
      });

      test('should be found by findUsersByPartOfEmail', async() => {
        const users = await User.findUsersByPartOfEmail('usert', {});
        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBe(2);
        expect(users[0]).toBeInstanceOf(User);
        expect(users[1]).toBeInstanceOf(User);
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
