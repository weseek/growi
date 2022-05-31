import mongoose from 'mongoose';

import { PageGrant } from '~/interfaces/page';
import UserGroup from '~/server/models/user-group';

import { getInstance } from '../setup-crowi';

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
  let rootPublicPage;
  let rootOnlyMePage;

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
  const pageRootOnlyMePagePath = '/OnlyMe';

  // const v4PageRootPublicPath = '/v4Public';
  const v4PageRootOnlyMePagePath = '/v4OnlyMe';
  const v4PageRootAnyoneWithTheLinkPagePath = '/v4AnyoneWithTheLink';
  const v4PageRootOnlyInsideTheGroupPagePath = '/v4OnlyInsideTheGroup';

  const pagePublicOnlyMePath = `${pageRootPublicPath}/OnlyMe`;
  const pagePublicAnyoneWithTheLinkPath = `${pageRootPublicPath}/AnyoneWithTheLink`;
  const pagePublicOnlyInsideTheGroupPath = `${pageRootPublicPath}/OnlyInsideTheGroup`;

  const pageOnlyMePublicPath = `${v4PageRootOnlyMePagePath}/Public`;
  const pageOnlyMeAnyoneWithTheLinkPath = `${v4PageRootOnlyMePagePath}/AnyoneWithTheLink`;
  const pageOnlyMeOnlyInsideTheGroupPath = `${v4PageRootOnlyMePagePath}/OnlyInsideTheGroup`;

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

    await Page.insertMany([
      // Root Page
      {
        path: rootPage,
        grant: Page.GRANT_PUBLIC,
        parent: null,
      },
      // OnlyMe v4
      {
        path: v4PageRootOnlyMePagePath,
        grant: Page.GRANT_OWNER,
        grantedUsers: [user1._id],
        parent: null,
      },
      // AnyoneWithTheLink v4
      {
        path: v4PageRootAnyoneWithTheLinkPagePath,
        grant: Page.GRANT_RESTRICTED,
        parent: null,
      },
      // OnlyInsideTheGroup v4
      {
        path: v4PageRootOnlyInsideTheGroupPagePath,
        grant: Page.GRANT_USER_GROUP,
        parent: null,
      },
    ]);

    rootPublicPage = await Page.findOne({ path: pageRootPublicPath });
    rootOnlyMePage = await Page.findOne({ path: v4PageRootOnlyMePagePath });

    // Leaf pages (Depth: 2)
    await Page.insertMany([
      /*
      * Parent is public
      */
      {
        path: pagePublicOnlyMePath,
        grant: Page.GRANT_OWNER,
        parent: rootPublicPage._id,
      },
      {
        path: pagePublicAnyoneWithTheLinkPath,
        grant: Page.GRANT_RESTRICTED,
        parent: rootPublicPage._id,
      },
      {
        path: pagePublicOnlyInsideTheGroupPath,
        grant: Page.GRANT_USER_GROUP,
        parent: rootPublicPage._id,
      },
      /*
      * Parent is onlyMe
      */
      {
        path: pageOnlyMePublicPath,
        grant: Page.GRANT_PUBLIC,
        parent: rootOnlyMePage._id,
      },
      {
        path: pageOnlyMeAnyoneWithTheLinkPath,
        grant: Page.GRANT_RESTRICTED,
        parent: rootOnlyMePage._id,
      },
      {
        path: pageOnlyMeOnlyInsideTheGroupPath,
        grant: Page.GRANT_USER_GROUP,
        parent: rootOnlyMePage._id,
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

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: root, Target: GroupParent', async() => {
      const targetPath = '/NEW_GroupParent';
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupId = groupParent._id;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: under-root public, Target: public', async() => {
      const targetPath = `${pageRootPublicPath}/NEW`;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupId = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: under-root GroupParent, Target: GroupParent', async() => {
      const targetPath = `${pageRootGroupParentPath}/NEW`;
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupId = groupParent._id;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: public, Target: public', async() => {
      const targetPath = `${pageE1PublicPath}/NEW`;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupId = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: owned by User1, Target: owned by User1', async() => {
      const targetPath = `${pageE2User1Path}/NEW`;
      const grant = Page.GRANT_OWNER;
      const grantedUserIds = [user1._id];
      const grantedGroupId = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return false when Ancestor: owned by GroupParent, Target: public', async() => {
      const targetPath = `${pageE3GroupParentPath}/NEW`;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupId = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(false);
    });

    test('Should return false when Ancestor: owned by GroupChild, Target: GroupParent', async() => {
      const targetPath = `${pageE3GroupChildPath}/NEW`;
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupId = groupParent._id;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

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

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Target: owned by User1, Descendant: User1 only', async() => {
      const targetPath = emptyPagePath2;
      const grant = Page.GRANT_OWNER;
      const grantedUserIds = [user1._id];
      const grantedGroupId = null;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Target: owned by GroupParent, Descendant: GroupParent, GroupChild and User1', async() => {
      const targetPath = emptyPagePath3;
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupId = groupParent._id;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return false when Target: owned by UserA, Descendant: public', async() => {
      const targetPath = emptyPagePath1;
      const grant = Page.GRANT_OWNER;
      const grantedUserIds = [user1._id];
      const grantedGroupId = null;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupId, shouldCheckDescendants);

      expect(result).toBe(false);
    });
  });


  describe('Test for calcApplicableGrantData', () => {
    test('Only Public is Applicable in case of top page', async() => {
      const result = await pageGrantService.calcApplicableGrantData(rootPage, user1);

      await expect(result[PageGrant.GRANT_PUBLIC]).toBeNull();
    });

    // parent property of all private pages is null
    test('Any grant is allowed if parent is null', async() => {
      const userGroupRelation = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user1);

      // OnlyMe
      const rootOnlyMePage = await Page.findOne({ path: v4PageRootOnlyMePagePath });
      const rootOnlyMePageRes = await pageGrantService.calcApplicableGrantData(rootOnlyMePage, user1);
      await expect(rootOnlyMePageRes[PageGrant.GRANT_PUBLIC]).toBeNull();
      await expect(rootOnlyMePageRes[PageGrant.GRANT_OWNER]).toBeNull();
      await expect(rootOnlyMePageRes[PageGrant.GRANT_USER_GROUP]).toEqual(userGroupRelation);

      // AnyoneWithTheLink
      const rootAnyoneWithTheLinkPage = await Page.findOne({ path: v4PageRootAnyoneWithTheLinkPagePath });
      const AnyoneWithTheLinkRes = await pageGrantService.calcApplicableGrantData(rootAnyoneWithTheLinkPage, user1);
      await expect(AnyoneWithTheLinkRes[PageGrant.GRANT_PUBLIC]).toBeNull();
      await expect(AnyoneWithTheLinkRes[PageGrant.GRANT_OWNER]).toBeNull();
      await expect(AnyoneWithTheLinkRes[PageGrant.GRANT_USER_GROUP]).toEqual(userGroupRelation);


      // OnlyInsideTheGroup
      const rootOnlyInsideTheGroupPage = await Page.findOne({ path: v4PageRootOnlyInsideTheGroupPagePath });
      const onlyInsideTheGroupRes = await pageGrantService.calcApplicableGrantData(rootOnlyInsideTheGroupPage, user1);
      await expect(onlyInsideTheGroupRes[PageGrant.GRANT_PUBLIC]).toBeNull();
      await expect(onlyInsideTheGroupRes[PageGrant.GRANT_OWNER]).toBeNull();
      await expect(onlyInsideTheGroupRes[PageGrant.GRANT_USER_GROUP]).toEqual(userGroupRelation);
    });


    test('Any grant is allowed if parent is public', async() => {
      const userGroupRelation = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user1);

      // OnlyMe
      const publicOnlyMePage = await Page.findOne({ path: pagePublicOnlyMePath });
      const publicOnlyMeRes = await pageGrantService.calcApplicableGrantData(publicOnlyMePage, user1);
      await expect(publicOnlyMeRes[PageGrant.GRANT_PUBLIC]).toBeNull();
      await expect(publicOnlyMeRes[PageGrant.GRANT_OWNER]).toBeNull();
      await expect(publicOnlyMeRes[PageGrant.GRANT_USER_GROUP]).toEqual(userGroupRelation);

      // AnyoneWithTheLink
      const publicAnyoneWithTheLinkPage = await Page.findOne({ path: pagePublicAnyoneWithTheLinkPath });
      const publicAnyoneWithTheLinkRes = await pageGrantService.calcApplicableGrantData(publicAnyoneWithTheLinkPage, user1);
      await expect(publicAnyoneWithTheLinkRes[PageGrant.GRANT_PUBLIC]).toBeNull();
      await expect(publicAnyoneWithTheLinkRes[PageGrant.GRANT_OWNER]).toBeNull();
      await expect(publicAnyoneWithTheLinkRes[PageGrant.GRANT_USER_GROUP]).toEqual(userGroupRelation);

      // OnlyInsideTheGroup
      const publicOnlyInsideTheGroupPage = await Page.findOne({ path: pagePublicOnlyInsideTheGroupPath });
      const publicOnlyInsideTheGroupRes = await pageGrantService.calcApplicableGrantData(publicOnlyInsideTheGroupPage, user1);
      await expect(publicOnlyInsideTheGroupRes[PageGrant.GRANT_PUBLIC]).toBeNull();
      await expect(publicOnlyInsideTheGroupRes[PageGrant.GRANT_OWNER]).toBeNull();
      await expect(publicOnlyInsideTheGroupRes[PageGrant.GRANT_USER_GROUP]).toEqual(userGroupRelation);
    });


    test('Only "GRANT_OWNER" is allowed if the user is the parent page\'s grantUser', async() => {
      // Public
      const onlyMePublicPage = await Page.findOne({ path: pageOnlyMePublicPath });
      const onlyMePublicRes = await pageGrantService.calcApplicableGrantData(onlyMePublicPage, user1);
      await expect(onlyMePublicRes[PageGrant.GRANT_OWNER]).toBeNull();

      // AnyoneWithTheLink
      const onlyMeAnyoneWithTheLinkPage = await Page.findOne({ path: pageOnlyMeAnyoneWithTheLinkPath });
      const onlyMeAnyoneWithTheLinkRes = await pageGrantService.calcApplicableGrantData(onlyMeAnyoneWithTheLinkPage, user1);
      await expect(onlyMeAnyoneWithTheLinkRes[PageGrant.GRANT_OWNER]).toBeNull();

      // OnlyInsideTheGroup
      const publicOnlyInsideTheGroupPage = await Page.findOne({ path: pageOnlyMeOnlyInsideTheGroupPath });
      const publicOnlyInsideTheGroupRes = await pageGrantService.calcApplicableGrantData(publicOnlyInsideTheGroupPage, user1);
      await expect(publicOnlyInsideTheGroupRes[PageGrant.GRANT_OWNER]).toBeNull();
    });

    // test('UserGroup included the user Only "GRANT_OWNER" is allowed if the parent page\'s grant is GRANT_USER_GROUP', async() => {
    //   // Public
    //   const onlyMePublicPage = await Page.findOne({ path: pageOnlyMePublicPath });
    //   const onlyMePublicRes = await pageGrantService.calcApplicableGrantData(onlyMePublicPage, user1);
    //   await expect(onlyMePublicRes[PageGrant.GRANT_OWNER]).toBeNull();

    //   // OnlyMe
    //   const onlyMeAnyoneWithTheLinkPage = await Page.findOne({ path: pageOnlyMeAnyoneWithTheLinkPath });
    //   const onlyMeAnyoneWithTheLinkRes = await pageGrantService.calcApplicableGrantData(onlyMeAnyoneWithTheLinkPage, user1);
    //   await expect(onlyMeAnyoneWithTheLinkRes[PageGrant.GRANT_OWNER]).toBeNull();

    //   // AnyoneWithTheLink
    //   const publicOnlyInsideTheGroupPage = await Page.findOne({ path: pageOnlyMeOnlyInsideTheGroupPath });
    //   const publicOnlyInsideTheGroupRes = await pageGrantService.calcApplicableGrantData(publicOnlyInsideTheGroupPage, user1);
    //   await expect(publicOnlyInsideTheGroupRes[PageGrant.GRANT_OWNER]).toBeNull();
    // });
  });


});
