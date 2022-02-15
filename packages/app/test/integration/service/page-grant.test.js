import mongoose from 'mongoose';

import { getInstance } from '../setup-crowi';
import UserGroup from '~/server/models/user-group';

/*
 * There are 3 grant types to test.
 * GRANT_PUBLIC, GRANT_OWNER, GRANT_USER_GROUP
 */
describe('PageGrantService', () => {
  /*
   * models
   */
  let User;
  let Page;
  let UserGroupRelation;

  /*
   * global instances
   */
  let crowi;
  let pageGrantService;
  let xssSpy;

  let user1;
  let user2;

  let groupParent;
  let groupChild;

  let rootPage;

  let emptyPage1;
  let emptyPage2;
  let emptyPage3;
  const emptyPagePath1 = '/E1';
  const emptyPagePath2 = '/E2';
  const emptyPagePath3 = '/E3';

  let pageRootPublic;
  let pageRootGroupParent;
  const pageRootPublicPath = '/Public';
  const pageRootGroupParentPath = '/GroupParent';

  let pageE1Public;
  let pageE2User1;
  let pageE3GroupParent;
  let pageE3GroupChild;
  let pageE3User1;
  const pageE1PublicPath = '/E1/Public';
  const pageE2User1Path = '/E2/User1';
  const pageE3GroupParentPath = '/E3/GroupParent';
  const pageE3GroupChildPath = '/E3/GroupChild';
  const pageE3User1Path = '/E3/User1';

  /*
   * prepare before all tests
   */
  beforeAll(async() => {
    crowi = await getInstance();

    pageGrantService = crowi.pageGrantService;

    User = mongoose.model('User');
    Page = mongoose.model('Page');
    UserGroupRelation = mongoose.model('UserGroupRelation');

    // Users
    await User.insertMany([
      { name: 'User1', username: 'User1', email: 'user1@example.com' },
      { name: 'User2', username: 'User2', email: 'user2@example.com' },
    ]);

    user1 = await User.findOne({ username: 'User1' });
    user2 = await User.findOne({ username: 'User2' });

    // Parent user groups
    await UserGroup.insertMany([
      {
        name: 'GroupParent',
        parent: null,
      },
    ]);
    groupParent = await UserGroup.findOne({ name: 'GroupParent' });

    // Child user groups
    await UserGroup.insertMany([
      {
        name: 'GroupChild',
        parent: groupParent._id,
      },
    ]);
    groupChild = await UserGroup.findOne({ name: 'GroupChild' });

    // UserGroupRelations
    await UserGroupRelation.insertMany([
      {
        relatedGroup: groupParent._id,
        relatedUser: user1._id,
      },
      {
        relatedGroup: groupParent._id,
        relatedUser: user2._id,
      },
      {
        relatedGroup: groupChild._id,
        relatedUser: user1._id,
      },
    ]);

    // Root page (Depth: 0)
    rootPage = await Page.findOne({ path: '/' });
    if (rootPage == null) {
      const pages = await Page.insertMany([
        {
          path: '/',
          grant: Page.GRANT_PUBLIC,
        },
      ]);
      rootPage = pages[0];
    }


    // Empty pages (Depth: 1)
    await Page.insertMany([
      {
        path: emptyPagePath1,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: rootPage._id,
      },
      {
        path: emptyPagePath2,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: rootPage._id,
      },
      {
        path: emptyPagePath3,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: rootPage._id,
      },
      {
        path: pageRootPublicPath,
        grant: Page.GRANT_PUBLIC,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: null,
        grantedGroup: null,
        parent: rootPage._id,
      },
      {
        path: pageRootGroupParentPath,
        grant: Page.GRANT_USER_GROUP,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: null,
        grantedGroup: groupParent._id,
        parent: rootPage._id,
      },
    ]);

    emptyPage1 = await Page.findOne({ path: emptyPagePath1 });
    emptyPage2 = await Page.findOne({ path: emptyPagePath2 });
    emptyPage3 = await Page.findOne({ path: emptyPagePath3 });

    // Leaf pages (Depth: 2)
    await Page.insertMany([
      {
        path: pageE1PublicPath,
        grant: Page.GRANT_PUBLIC,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: null,
        grantedGroup: null,
        parent: emptyPage1._id,
      },
      {
        path: pageE2User1Path,
        grant: Page.GRANT_OWNER,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: [user1._id],
        grantedGroup: null,
        parent: emptyPage2._id,
      },
      {
        path: pageE3GroupParentPath,
        grant: Page.GRANT_USER_GROUP,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: null,
        grantedGroup: groupParent._id,
        parent: emptyPage3._id,
      },
      {
        path: pageE3GroupChildPath,
        grant: Page.GRANT_USER_GROUP,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: null,
        grantedGroup: groupChild._id,
        parent: emptyPage3._id,
      },
      {
        path: pageE3User1Path,
        grant: Page.GRANT_OWNER,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: [user1._id],
        grantedGroup: null,
        parent: emptyPage3._id,
      },
    ]);
    pageE1Public = await Page.findOne({ path: pageE1PublicPath });
    pageE2User1 = await Page.findOne({ path: pageE2User1Path });
    pageE3GroupParent = await Page.findOne({ path: pageE3GroupParentPath });
    pageE3GroupChild = await Page.findOne({ path: pageE3GroupChildPath });
    pageE3User1 = await Page.findOne({ path: pageE3User1Path });

    xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);
  });

  describe('Test isGrantNormalized method with shouldCheckDescendants false', () => {
    test('Should return true when Ancestor: root, Target: public', async() => {
      const targetPath = '/NEW';
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupId = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: root, Target: GroupParent', async() => {
      const targetPath = '/NEW_GroupParent';
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupId = groupParent._id;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: under-root public, Target: public', async() => {
      const targetPath = `${pageRootPublicPath}/NEW`;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupId = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: under-root GroupParent, Target: GroupParent', async() => {
      const targetPath = `${pageRootGroupParentPath}/NEW`;
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupId = groupParent._id;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: public, Target: public', async() => {
      const targetPath = `${pageE1PublicPath}/NEW`;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupId = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: owned by User1, Target: owned by User1', async() => {
      const targetPath = `${pageE2User1Path}/NEW`;
      const grant = Page.GRANT_OWNER;
      const grantedUserIds = [user1._id];
      const grantedGroupId = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return false when Ancestor: owned by GroupParent, Target: public', async() => {
      const targetPath = `${pageE3GroupParentPath}/NEW`;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupId = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(false);
    });

    test('Should return false when Ancestor: owned by GroupChild, Target: GroupParent', async() => {
      const targetPath = `${pageE3GroupChildPath}/NEW`;
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupId = groupParent._id;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(false);
    });
  });

  describe('Test isGrantNormalized method with shouldCheckDescendants true', () => {
    test('Should return true when Target: public, Descendant: public', async() => {
      const targetPath = emptyPagePath1;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupId = null;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Target: owned by User1, Descendant: User1 only', async() => {
      const targetPath = emptyPagePath2;
      const grant = Page.GRANT_OWNER;
      const grantedUserIds = [user1._id];
      const grantedGroupId = null;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Target: owned by GroupParent, Descendant: GroupParent, GroupChild and User1', async() => {
      const targetPath = emptyPagePath3;
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupId = groupParent._id;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return false when Target: owned by UserA, Descendant: public', async() => {
      const targetPath = emptyPagePath1;
      const grant = Page.GRANT_OWNER;
      const grantedUserIds = [user1._id];
      const grantedGroupId = null;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(false);
    });
  });

});
