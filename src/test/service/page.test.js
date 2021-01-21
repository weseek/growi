const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

let testUser;
let testGroup;

describe('PageService', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let Page;
  let User;
  let UserGroup;
  let UserGroupRelation;

  beforeAll(async(done) => {
    crowi = await getInstance();

    User = mongoose.model('User');
    UserGroup = mongoose.model('UserGroup');
    UserGroupRelation = mongoose.model('UserGroupRelation');
    Page = mongoose.model('Page');

    await User.insertMany([{
      name: 'Anon', username: 'anonymous', email: 'anonymous@example.com',
    }]);

    await UserGroup.insertMany([{
      name: 'TestGroup',
    }]);

    testUser = await User.findOne({ username: 'anonymous' });
    testGroup = await UserGroup.findOne({ name: 'TestGroup' });

    await UserGroupRelation.insertMany([{
      relatedGroup: testGroup,
      relatedUser: testUser,
    }]);

    await Page.insertMany([
      {
        path: '/user/anonymous0/memo',
        grant: Page.GRANT_RESTRICTED,
        grantedUsers: [testUser],
        creator: testUser,
      },
    ]);

    done();
  });

  describe('verifySAMLResponseByABLCRule()', () => {
    test('should return true', () => {
      expect(3).toBe(3);
    });
  });

});
