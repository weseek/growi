import { GroupType, PageGrant } from '@growi/core';
import mongoose from 'mongoose';

import { ExternalGroupProviderType } from '~/features/external-user-group/interfaces/external-user-group';
import ExternalUserGroup from '~/features/external-user-group/server/models/external-user-group';
import ExternalUserGroupRelation from '~/features/external-user-group/server/models/external-user-group-relation';
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

  let externalGroupParent;
  let externalGroupChild;

  const userGroupIdParent = new mongoose.Types.ObjectId();
  const externalUserGroupIdParent = new mongoose.Types.ObjectId();

  let rootPage;
  let rootPublicPage;
  let rootOnlyMePage;
  let rootOnlyInsideTheGroup;
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

  const v4PageRootOnlyMePagePath = '/v4OnlyMe';
  const v4PageRootAnyoneWithTheLinkPagePath = '/v4AnyoneWithTheLink';
  const v4PageRootOnlyInsideTheGroupPagePath = '/v4OnlyInsideTheGroup';

  const pagePublicOnlyMePath = `${pageRootPublicPath}/OnlyMe`;
  const pagePublicAnyoneWithTheLinkPath = `${pageRootPublicPath}/AnyoneWithTheLink`;
  const pagePublicOnlyInsideTheGroupPath = `${pageRootPublicPath}/OnlyInsideTheGroup`;

  const pageOnlyMePublicPath = `${v4PageRootOnlyMePagePath}/Public`;
  const pageOnlyMeAnyoneWithTheLinkPath = `${v4PageRootOnlyMePagePath}/AnyoneWithTheLink`;
  const pageOnlyMeOnlyInsideTheGroupPath = `${v4PageRootOnlyMePagePath}/OnlyInsideTheGroup`;

  const pageOnlyInsideTheGroupPublicPath = `${v4PageRootOnlyInsideTheGroupPagePath}/Public`;
  const pageOnlyInsideTheGroupOnlyMePath = `${v4PageRootOnlyInsideTheGroupPagePath}/OnlyMe`;
  const pageOnlyInsideTheGroupAnyoneWithTheLinkPath = `${v4PageRootOnlyInsideTheGroupPagePath}/AnyoneWithTheLink`;
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

  const createDocumentsToTestIsGrantNormalized = async() => {
    // Users
    await User.insertMany([
      { name: 'User1', username: 'User1', email: 'user1@example.com' },
      { name: 'User2', username: 'User2', email: 'user2@example.com' },
    ]);

    user1 = await User.findOne({ username: 'User1' });
    user2 = await User.findOne({ username: 'User2' });

    await UserGroup.insertMany([
      {
        _id: userGroupIdParent,
        name: 'GroupParent',
        parent: null,
      },
      {
        name: 'GroupChild',
        parent: userGroupIdParent,
      },
    ]);

    groupParent = await UserGroup.findOne({ name: 'GroupParent' });
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

    await ExternalUserGroup.insertMany([
      {
        _id: externalUserGroupIdParent,
        name: 'ExternalGroupParent',
        externalId: 'ExternalGroupParent',
        provider: ExternalGroupProviderType.ldap,
        parent: null,
      },
      {
        name: 'ExternalGroupChild',
        externalId: 'ExternalGroupChild',
        provider: ExternalGroupProviderType.ldap,
        parent: externalUserGroupIdParent,
      },
    ]);

    externalGroupParent = await ExternalUserGroup.findOne({ name: 'ExternalGroupParent' });
    externalGroupChild = await ExternalUserGroup.findOne({ name: 'ExternalGroupChild' });

    await ExternalUserGroupRelation.insertMany([
      {
        relatedGroup: externalGroupParent._id,
        relatedUser: user1._id,
      },
      {
        relatedGroup: externalGroupParent._id,
        relatedUser: user2._id,
      },
      {
        relatedGroup: externalGroupChild._id,
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
        grantedGroups: null,
        parent: rootPage._id,
      },
      {
        path: pageRootGroupParentPath,
        grant: Page.GRANT_USER_GROUP,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: null,
        grantedGroups: [{ item: groupParent._id, type: GroupType.userGroup }, { item: externalGroupParent._id, type: GroupType.externalUserGroup }],
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
        grantedGroups: [{ item: groupParent._id, type: GroupType.userGroup }, { item: externalGroupParent._id, type: GroupType.externalUserGroup }],
      },
    ]);

    rootPublicPage = await Page.findOne({ path: pageRootPublicPath });
    rootOnlyMePage = await Page.findOne({ path: v4PageRootOnlyMePagePath });
    rootOnlyInsideTheGroup = await Page.findOne({ path: v4PageRootOnlyInsideTheGroupPagePath });


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
      /*
      * Parent is OnlyInsideTheGroup
      */
      {
        path: pageOnlyInsideTheGroupPublicPath,
        grant: Page.GRANT_PUBLIC,
        parent: rootOnlyInsideTheGroup._id,
      },
      {
        path: pageOnlyInsideTheGroupOnlyMePath,
        grant: Page.GRANT_PUBLIC,
        parent: rootOnlyInsideTheGroup._id,
      },
      {
        path: pageOnlyInsideTheGroupAnyoneWithTheLinkPath,
        grant: Page.GRANT_PUBLIC,
        parent: rootOnlyInsideTheGroup._id,
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
        grantedGroups: null,
        parent: emptyPage1._id,
      },
      {
        path: pageE2User1Path,
        grant: Page.GRANT_OWNER,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: [user1._id],
        grantedGroups: null,
        parent: emptyPage2._id,
      },
      {
        path: pageE3GroupParentPath,
        grant: Page.GRANT_USER_GROUP,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: null,
        grantedGroups: [{ item: groupParent._id, type: GroupType.userGroup }, { item: externalGroupParent._id, type: GroupType.externalUserGroup }],
        parent: emptyPage3._id,
      },
      {
        path: pageE3GroupChildPath,
        grant: Page.GRANT_USER_GROUP,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: null,
        grantedGroups: [{ item: groupChild._id, type: GroupType.userGroup }, { item: externalGroupChild._id, type: GroupType.externalUserGroup }],
        parent: emptyPage3._id,
      },
      {
        path: pageE3User1Path,
        grant: Page.GRANT_OWNER,
        creator: user1,
        lastUpdateUser: user1,
        grantedUsers: [user1._id],
        grantedGroups: null,
        parent: emptyPage3._id,
      },
    ]);
    pageE1Public = await Page.findOne({ path: pageE1PublicPath });
    pageE2User1 = await Page.findOne({ path: pageE2User1Path });
    pageE3GroupParent = await Page.findOne({ path: pageE3GroupParentPath });
    pageE3GroupChild = await Page.findOne({ path: pageE3GroupChildPath });
    pageE3User1 = await Page.findOne({ path: pageE3User1Path });
  };

  /*
   * prepare before all tests
   */
  beforeAll(async() => {
    crowi = await getInstance();

    pageGrantService = crowi.pageGrantService;

    User = mongoose.model('User');
    Page = mongoose.model('Page');
    UserGroupRelation = mongoose.model('UserGroupRelation');

    rootPage = await Page.findOne({ path: '/' });

    await createDocumentsToTestIsGrantNormalized();

    xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);
  });

  describe('Test isGrantNormalized method with shouldCheckDescendants false', () => {
    test('Should return true when Ancestor: root, Target: public', async() => {
      const targetPath = '/NEW';
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupIds = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: root, Target: GroupParent', async() => {
      const targetPath = '/NEW_GroupParent';
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupIds = [{ item: groupParent._id, type: GroupType.userGroup }, { item: externalGroupParent._id, type: GroupType.externalUserGroup }];
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: under-root public, Target: public', async() => {
      const targetPath = `${pageRootPublicPath}/NEW`;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupIds = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: under-root GroupParent, Target: GroupParent', async() => {
      const targetPath = `${pageRootGroupParentPath}/NEW`;
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupIds = [{ item: groupParent._id, type: GroupType.userGroup }, { item: externalGroupParent._id, type: GroupType.externalUserGroup }];
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: public, Target: public', async() => {
      const targetPath = `${pageE1PublicPath}/NEW`;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupIds = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Ancestor: owned by User1, Target: owned by User1', async() => {
      const targetPath = `${pageE2User1Path}/NEW`;
      const grant = Page.GRANT_OWNER;
      const grantedUserIds = [user1._id];
      const grantedGroupIds = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return false when Ancestor: owned by GroupParent, Target: public', async() => {
      const targetPath = `${pageE3GroupParentPath}/NEW`;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupIds = null;
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(false);
    });

    test('Should return false when Ancestor: owned by GroupChild, Target: GroupParent', async() => {
      const targetPath = `${pageE3GroupChildPath}/NEW`;
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupIds = [{ item: groupParent._id, type: GroupType.userGroup }, { item: externalGroupParent._id, type: GroupType.externalUserGroup }];
      const shouldCheckDescendants = false;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(false);
    });
  });

  describe('Test isGrantNormalized method with shouldCheckDescendants true', () => {
    test('Should return true when Target: public, Descendant: public', async() => {
      const targetPath = emptyPagePath1;
      const grant = Page.GRANT_PUBLIC;
      const grantedUserIds = null;
      const grantedGroupIds = null;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Target: owned by User1, Descendant: User1 only', async() => {
      const targetPath = emptyPagePath2;
      const grant = Page.GRANT_OWNER;
      const grantedUserIds = [user1._id];
      const grantedGroupIds = null;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return true when Target: owned by GroupParent, Descendant: GroupParent, GroupChild and User1', async() => {
      const targetPath = emptyPagePath3;
      const grant = Page.GRANT_USER_GROUP;
      const grantedUserIds = null;
      const grantedGroupIds = [{ item: groupParent._id, type: GroupType.userGroup }, { item: externalGroupParent._id, type: GroupType.externalUserGroup }];
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(true);
    });

    test('Should return false when Target: owned by UserA, Descendant: public', async() => {
      const targetPath = emptyPagePath1;
      const grant = Page.GRANT_OWNER;
      const grantedUserIds = [user1._id];
      const grantedGroupIds = null;
      const shouldCheckDescendants = true;

      const result = await pageGrantService.isGrantNormalized(user1, targetPath, grant, grantedUserIds, grantedGroupIds, shouldCheckDescendants);

      expect(result).toBe(false);
    });
  });


  describe('Test for calcApplicableGrantData', () => {
    test('Only Public is Applicable in case of top page', async() => {
      const result = await pageGrantService.calcApplicableGrantData(rootPage, user1);

      expect(result).toStrictEqual(
        {
          [PageGrant.GRANT_PUBLIC]: null,
        },
      );
    });

    // parent property of all private pages is null
    test('Any grant is allowed if parent is null', async() => {
      const userPossessedUserGroups = await UserGroupRelation.findAllGroupsForUser(user1);
      const userPossessedExternalUserGroups = await ExternalUserGroupRelation.findAllGroupsForUser(user1);
      const userPossessedGroups = [
        ...userPossessedUserGroups.map((group) => {
          return { type: GroupType.userGroup, item: group };
        }),
        ...userPossessedExternalUserGroups.map((group) => {
          return { type: GroupType.externalUserGroup, item: group };
        }),
      ];

      // OnlyMe
      const rootOnlyMePage = await Page.findOne({ path: v4PageRootOnlyMePagePath });
      const rootOnlyMePageRes = await pageGrantService.calcApplicableGrantData(rootOnlyMePage, user1);
      expect(rootOnlyMePageRes).toStrictEqual(
        {
          [PageGrant.GRANT_PUBLIC]: null,
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
          [PageGrant.GRANT_USER_GROUP]: { applicableGroups: userPossessedGroups },
        },
      );

      // AnyoneWithTheLink
      const rootAnyoneWithTheLinkPage = await Page.findOne({ path: v4PageRootAnyoneWithTheLinkPagePath });
      const anyoneWithTheLinkRes = await pageGrantService.calcApplicableGrantData(rootAnyoneWithTheLinkPage, user1);
      expect(anyoneWithTheLinkRes).toStrictEqual(
        {
          [PageGrant.GRANT_PUBLIC]: null,
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
          [PageGrant.GRANT_USER_GROUP]: { applicableGroups: userPossessedGroups },
        },
      );

      // OnlyInsideTheGroup
      const rootOnlyInsideTheGroupPage = await Page.findOne({ path: v4PageRootOnlyInsideTheGroupPagePath });
      const onlyInsideTheGroupRes = await pageGrantService.calcApplicableGrantData(rootOnlyInsideTheGroupPage, user1);
      expect(onlyInsideTheGroupRes).toStrictEqual(
        {
          [PageGrant.GRANT_PUBLIC]: null,
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
          [PageGrant.GRANT_USER_GROUP]: { applicableGroups: userPossessedGroups },
        },
      );
    });


    test('Any grant is allowed if parent is public', async() => {
      const userPossessedUserGroups = await UserGroupRelation.findAllGroupsForUser(user1);
      const userPossessedExternalUserGroups = await ExternalUserGroupRelation.findAllGroupsForUser(user1);
      const userPossessedGroups = [
        ...userPossessedUserGroups.map((group) => {
          return { type: GroupType.userGroup, item: group };
        }),
        ...userPossessedExternalUserGroups.map((group) => {
          return { type: GroupType.externalUserGroup, item: group };
        }),
      ];

      // OnlyMe
      const publicOnlyMePage = await Page.findOne({ path: pagePublicOnlyMePath });
      const publicOnlyMeRes = await pageGrantService.calcApplicableGrantData(publicOnlyMePage, user1);
      expect(publicOnlyMeRes).toStrictEqual(
        {
          [PageGrant.GRANT_PUBLIC]: null,
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
          [PageGrant.GRANT_USER_GROUP]: { applicableGroups: userPossessedGroups },
        },
      );

      // AnyoneWithTheLink
      const publicAnyoneWithTheLinkPage = await Page.findOne({ path: pagePublicAnyoneWithTheLinkPath });
      const publicAnyoneWithTheLinkRes = await pageGrantService.calcApplicableGrantData(publicAnyoneWithTheLinkPage, user1);
      expect(publicAnyoneWithTheLinkRes).toStrictEqual(
        {
          [PageGrant.GRANT_PUBLIC]: null,
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
          [PageGrant.GRANT_USER_GROUP]: { applicableGroups: userPossessedGroups },
        },
      );

      // OnlyInsideTheGroup
      const publicOnlyInsideTheGroupPage = await Page.findOne({ path: pagePublicOnlyInsideTheGroupPath });
      const publicOnlyInsideTheGroupRes = await pageGrantService.calcApplicableGrantData(publicOnlyInsideTheGroupPage, user1);
      expect(publicOnlyInsideTheGroupRes).toStrictEqual(
        {
          [PageGrant.GRANT_PUBLIC]: null,
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
          [PageGrant.GRANT_USER_GROUP]: { applicableGroups: userPossessedGroups },
        },
      );
    });


    test('Only "GRANT_OWNER" is allowed if the user is the parent page\'s grantUser', async() => {
      // Public
      const onlyMePublicPage = await Page.findOne({ path: pageOnlyMePublicPath });
      const onlyMePublicRes = await pageGrantService.calcApplicableGrantData(onlyMePublicPage, user1);
      expect(onlyMePublicRes).toStrictEqual(
        {
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
        },
      );

      // AnyoneWithTheLink
      const onlyMeAnyoneWithTheLinkPage = await Page.findOne({ path: pageOnlyMeAnyoneWithTheLinkPath });
      const onlyMeAnyoneWithTheLinkRes = await pageGrantService.calcApplicableGrantData(onlyMeAnyoneWithTheLinkPage, user1);
      expect(onlyMeAnyoneWithTheLinkRes).toStrictEqual(
        {
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
        },
      );

      // OnlyInsideTheGroup
      const publicOnlyInsideTheGroupPage = await Page.findOne({ path: pageOnlyMeOnlyInsideTheGroupPath });
      const publicOnlyInsideTheGroupRes = await pageGrantService.calcApplicableGrantData(publicOnlyInsideTheGroupPage, user1);
      expect(publicOnlyInsideTheGroupRes).toStrictEqual(
        {
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
        },
      );
    });

    test('"GRANT_OWNER" is not allowed if the user is not the parent page\'s grantUser', async() => {
      // Public
      const onlyMePublicPage = await Page.findOne({ path: pageOnlyMePublicPath });
      const onlyMePublicRes = await pageGrantService.calcApplicableGrantData(onlyMePublicPage, user2);
      expect(onlyMePublicRes).toStrictEqual(
        {
          [PageGrant.GRANT_RESTRICTED]: null,
        },
      );

      // AnyoneWithTheLink
      const onlyMeAnyoneWithTheLinkPage = await Page.findOne({ path: pageOnlyMeAnyoneWithTheLinkPath });
      const onlyMeAnyoneWithTheLinkRes = await pageGrantService.calcApplicableGrantData(onlyMeAnyoneWithTheLinkPage, user2);
      expect(onlyMeAnyoneWithTheLinkRes).toStrictEqual(
        {
          [PageGrant.GRANT_RESTRICTED]: null,
        },
      );

      // OnlyInsideTheGroup
      const publicOnlyInsideTheGroupPage = await Page.findOne({ path: pageOnlyMeOnlyInsideTheGroupPath });
      const publicOnlyInsideTheGroupRes = await pageGrantService.calcApplicableGrantData(publicOnlyInsideTheGroupPage, user2);
      expect(publicOnlyInsideTheGroupRes).toStrictEqual(
        {
          [PageGrant.GRANT_RESTRICTED]: null,
        },
      );
    });

    test('"GRANT_USER_GROUP" is allowed if the parent\'s grant is GRANT_USER_GROUP and the user is included in the group', async() => {
      const userGroups = await UserGroupRelation.findGroupsWithDescendantsByGroupAndUser(groupParent, user1);
      const externalUserGroups = await ExternalUserGroupRelation.findGroupsWithDescendantsByGroupAndUser(externalGroupParent, user1);
      const applicableGroups = [
        ...userGroups.map((group) => {
          return { type: GroupType.userGroup, item: group };
        }),
        ...externalUserGroups.map((group) => {
          return { type: GroupType.externalUserGroup, item: group };
        }),
      ];

      // Public
      const onlyInsideGroupPublicPage = await Page.findOne({ path: pageOnlyInsideTheGroupPublicPath });
      const onlyInsideGroupPublicRes = await pageGrantService.calcApplicableGrantData(onlyInsideGroupPublicPage, user1);
      expect(onlyInsideGroupPublicRes).toStrictEqual(
        {
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
          [PageGrant.GRANT_USER_GROUP]: { applicableGroups },
        },
      );

      // OnlyMe
      const onlyInsideTheGroupOnlyMePage = await Page.findOne({ path: pageOnlyInsideTheGroupOnlyMePath });
      const onlyInsideTheGroupOnlyMeRes = await pageGrantService.calcApplicableGrantData(onlyInsideTheGroupOnlyMePage, user1);
      expect(onlyInsideTheGroupOnlyMeRes).toStrictEqual(
        {
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
          [PageGrant.GRANT_USER_GROUP]: { applicableGroups },
        },
      );

      // AnyoneWithTheLink
      const onlyInsideTheGroupAnyoneWithTheLinkPage = await Page.findOne({ path: pageOnlyInsideTheGroupAnyoneWithTheLinkPath });
      const onlyInsideTheGroupAnyoneWithTheLinkRes = await pageGrantService.calcApplicableGrantData(onlyInsideTheGroupAnyoneWithTheLinkPage, user1);
      expect(onlyInsideTheGroupAnyoneWithTheLinkRes).toStrictEqual(
        {
          [PageGrant.GRANT_RESTRICTED]: null,
          [PageGrant.GRANT_OWNER]: null,
          [PageGrant.GRANT_USER_GROUP]: { applicableGroups },
        },
      );
    });
  });
});
