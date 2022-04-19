const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');


describe('User', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let User;

  let adminusertest2Id;

  beforeAll(async() => {
    crowi = await getInstance();
    User = mongoose.model('User');

    await User.insertMany([
      {
        name: 'Example for User Test',
        username: 'usertest',
        email: 'usertest@example.com',
        password: 'usertestpass',
        lang: 'en_US',
      },
      {
        name: 'Admin Example',
        username: 'adminusertest1',
        email: 'adminusertest@example.com',
        password: 'adminusertestpass',
        lang: 'en_US',
      },
      {
        name: 'Admin Example to delete',
        username: 'adminusertest2',
        email: 'adminusertest2@example.com',
        password: 'adminusertestpass',
        lang: 'en_US',
      },
    ]);

    // delete adminusertest2
    const adminusertest2 = await User.findOne({ username: 'adminusertest2' });
    adminusertest2Id = adminusertest2._id;
    await adminusertest2.statusDelete();
  });

  describe('Create and Find.', () => {
    describe('The user', () => {
      test('should created with createUserByEmailAndPassword', (done) => {
        User.createUserByEmailAndPassword('Example2 for User Test', 'usertest2', 'usertest2@example.com', 'usertest2pass', 'en_US', (err, userData) => {
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

    });
  });

  describe('Delete.', () => {
    test('adminusertest2 should have correct attributes', async() => {
      const adminusertest2 = await User.findOne({ _id: adminusertest2Id });

      expect(adminusertest2).toBeInstanceOf(User);
      expect(adminusertest2.name).toBe('');
      expect(adminusertest2.password).toBe('');
      expect(adminusertest2.googleId).toBeNull();
      expect(adminusertest2.isGravatarEnabled).toBeFalsy();
      expect(adminusertest2.image).toBeNull();
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
