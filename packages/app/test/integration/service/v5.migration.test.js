/* eslint-disable max-len */
const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

describe('V5 page migration', () => {
  let crowi;
  let Page;
  let User;
  let UserGroup;
  let UserGroupRelation;

  let testUser1;
  let rootUser;

  let rootPage;

  const rootUserGroupId = new mongoose.Types.ObjectId();
  const testUser1GroupId = new mongoose.Types.ObjectId();
  const groupIdIsolate = new mongoose.Types.ObjectId();
  const groupIdA = new mongoose.Types.ObjectId();
  const groupIdB = new mongoose.Types.ObjectId();
  const groupIdC = new mongoose.Types.ObjectId();

  const pageId1 = new mongoose.Types.ObjectId();
  const pageId2 = new mongoose.Types.ObjectId();
  const pageId3 = new mongoose.Types.ObjectId();
  const pageId4 = new mongoose.Types.ObjectId();
  const pageId5 = new mongoose.Types.ObjectId();
  const pageId6 = new mongoose.Types.ObjectId();
  const pageId7 = new mongoose.Types.ObjectId();
  const pageId8 = new mongoose.Types.ObjectId();
  const pageId9 = new mongoose.Types.ObjectId();
  const pageId10 = new mongoose.Types.ObjectId();
  const pageId11 = new mongoose.Types.ObjectId();

  beforeAll(async() => {
    jest.restoreAllMocks();

    crowi = await getInstance();
    Page = mongoose.model('Page');
    User = mongoose.model('User');
    UserGroup = mongoose.model('UserGroup');
    UserGroupRelation = mongoose.model('UserGroupRelation');

    await crowi.configManager.updateConfigsInTheSameNamespace('crowi', { 'app:isV5Compatible': true });

    await User.insertMany([
      { name: 'rootUser', username: 'rootUser', email: 'rootUser@example.com' },
      { name: 'testUser1', username: 'testUser1', email: 'testUser1@example.com' },
    ]);
    rootUser = await User.findOne({ username: 'rootUser' });
    testUser1 = await User.findOne({ username: 'testUser1' });
    rootPage = await Page.findOne({ path: '/' });

    await UserGroup.insertMany([
      {
        _id: rootUserGroupId,
        name: 'rootUserGroup',
      },
      {
        _id: testUser1GroupId,
        name: 'testUser1Group',
      },
      {
        _id: groupIdIsolate,
        name: 'groupIsolate',
      },
      {
        _id: groupIdA,
        name: 'groupA',
      },
      {
        _id: groupIdB,
        name: 'groupB',
        parent: groupIdA,
      },
      {
        _id: groupIdC,
        name: 'groupC',
        parent: groupIdB,
      },
    ]);

    await UserGroupRelation.insertMany([
      {
        relatedGroup: rootUserGroupId,
        relatedUser: rootUser._id,
      },
      {
        relatedGroup: testUser1GroupId,
        relatedUser: testUser1._id,
      },
      {
        relatedGroup: groupIdIsolate,
        relatedUser: testUser1._id,
      },
      {
        relatedGroup: groupIdA,
        relatedUser: testUser1._id,
      },
      {
        relatedGroup: groupIdB,
        relatedUser: testUser1._id,
      },
      {
        relatedGroup: groupIdC,
        relatedUser: testUser1._id,
      },
    ]);

    await Page.insertMany([
      {
        path: '/private1',
        grant: Page.GRANT_OWNER,
        creator: testUser1,
        lastUpdateUser: testUser1,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/dummyParent/private1',
        grant: Page.GRANT_OWNER,
        creator: testUser1,
        lastUpdateUser: testUser1,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/dummyParent/private1/private2',
        grant: Page.GRANT_OWNER,
        creator: testUser1,
        lastUpdateUser: testUser1,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/dummyParent/private1/private3',
        grant: Page.GRANT_OWNER,
        creator: testUser1,
        lastUpdateUser: testUser1,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId1,
        path: '/normalize_1',
        parent: rootPage._id,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
      },
      {
        _id: pageId2,
        path: '/normalize_1/normalize_2',
        parent: pageId1,
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdB,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId3,
        path: '/normalize_1',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId4,
        path: '/normalize_4',
        parent: rootPage._id,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
      },
      {
        _id: pageId5,
        path: '/normalize_4/normalize_5',
        parent: pageId4,
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId6,
        path: '/normalize_4',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdIsolate,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/normalize_7/normalize_8_gA',
        grant: Page.GRANT_USER_GROUP,
        creator: testUser1,
        grantedGroup: groupIdA,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/normalize_7/normalize_8_gA/normalize_9_gB',
        grant: Page.GRANT_USER_GROUP,
        creator: testUser1,
        grantedGroup: groupIdB,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/normalize_7/normalize_8_gC',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdC,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId7,
        path: '/normalize_10',
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: rootPage._id,
        descendantCount: 3,
      },
      {
        _id: pageId8,
        path: '/normalize_10/normalize_11_gA',
        isEmpty: true,
        parent: pageId7,
        descendantCount: 1,
      },
      {
        _id: pageId9, // not v5
        path: '/normalize_10/normalize_11_gA',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId10,
        path: '/normalize_10/normalize_11_gA/normalize_11_gB',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdB,
        grantedUsers: [testUser1._id],
        parent: pageId8,
        descendantCount: 0,
      },
      {
        _id: pageId11,
        path: '/normalize_10/normalize_12_gC',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdC,
        grantedUsers: [testUser1._id],
        parent: pageId7,
        descendantCount: 0,
      },

    ]);

  });

  // https://github.com/jest-community/eslint-plugin-jest/blob/v24.3.5/docs/rules/expect-expect.md#assertfunctionnames
  // pass unless the data is one of [false, 0, '', null, undefined, NaN]
  const expectAllToBeTruthy = (dataList) => {
    dataList.forEach((data, i) => {
      if (data == null) { console.log(`index: ${i}`) }
      expect(data).toBeTruthy();
    });
  };

  const normalizeParentRecursivelyByPages = async(pages, user) => {
    return crowi.pageService.normalizeParentRecursivelyByPages(pages, user);
  };

  const normalizeParentByPageId = async(page, user) => {
    return crowi.pageService.normalizeParentByPageId(page, user);
  };

  describe('normalizeParentRecursivelyByPages()', () => {

    test('should migrate all pages specified by pageIds', async() => {
      jest.restoreAllMocks();

      const pagesToRun = await Page.find({ path: { $in: ['/private1', '/dummyParent/private1'] } });

      // migrate
      await normalizeParentRecursivelyByPages(pagesToRun, testUser1);
      const migratedPages = await Page.find({
        path: {
          $in: ['/private1', '/dummyParent', '/dummyParent/private1', '/dummyParent/private1/private2', '/dummyParent/private1/private3'],
        },
      });
      const migratedPagePaths = migratedPages.filter(doc => doc.parent != null).map(doc => doc.path);

      const expected = ['/private1', '/dummyParent', '/dummyParent/private1', '/dummyParent/private1/private2', '/dummyParent/private1/private3'];

      expect(migratedPagePaths.sort()).toStrictEqual(expected.sort());
    });

    test('should change all v4 pages with usergroup to v5 compatible and create new parent page', async() => {
      const page8 = await Page.findOne({ path: '/normalize_7/normalize_8_gA' });
      const page9 = await Page.findOne({ path: '/normalize_7/normalize_8_gA/normalize_9_gB' });
      const page10 = await Page.findOne({ path: '/normalize_7/normalize_8_gC' });
      const page11 = await Page.findOne({ path: '/normalize_7' });
      expectAllToBeTruthy([page8, page9, page10]);
      expect(page11).toBeNull();
      await normalizeParentRecursivelyByPages([page8, page9, page10], testUser1);

      // AM => After Migration
      const page7 = await Page.findOne({ path: '/normalize_7' });
      const page8AM = await Page.findOne({ path: '/normalize_7/normalize_8_gA' });
      const page9AM = await Page.findOne({ path: '/normalize_7/normalize_8_gA/normalize_9_gB' });
      const page10AM = await Page.findOne({ path: '/normalize_7/normalize_8_gC' });
      expectAllToBeTruthy([page7, page8AM, page9AM, page10AM]);

      expect(page7.isEmpty).toBe(true);

      expect(page7.parent).toStrictEqual(rootPage._id);
      expect(page8AM.parent).toStrictEqual(page7._id);
      expect(page9AM.parent).toStrictEqual(page8AM._id);
      expect(page10AM.parent).toStrictEqual(page7._id);
    });

    test('should replace empty page with same path with new non-empty page and update all related children\'s parent', async() => {
      const page1 = await Page.findOne({ path: '/normalize_10', isEmpty: true, parent: { $ne: null } });
      const page2 = await Page.findOne({
        path: '/normalize_10/normalize_11_gA', _id: pageId8, isEmpty: true, parent: { $ne: null },
      });
      const page3 = await Page.findOne({ path: '/normalize_10/normalize_11_gA', _id: pageId9, parent: null }); // not v5
      const page4 = await Page.findOne({ path: '/normalize_10/normalize_11_gA/normalize_11_gB', parent: { $ne: null } });
      const page5 = await Page.findOne({ path: '/normalize_10/normalize_12_gC', parent: { $ne: null } });
      expectAllToBeTruthy([page1, page2, page3, page4, page5]);

      await normalizeParentRecursivelyByPages([page3], testUser1);

      // AM => After Migration
      const page1AM = await Page.findOne({ path: '/normalize_10' });
      const page2AM = await Page.findOne({ path: '/normalize_10/normalize_11_gA', _id: pageId8 });
      const page3AM = await Page.findOne({ path: '/normalize_10/normalize_11_gA', _id: pageId9 });
      const page4AM = await Page.findOne({ path: '/normalize_10/normalize_11_gA/normalize_11_gB' });
      const page5AM = await Page.findOne({ path: '/normalize_10/normalize_12_gC' });
      expectAllToBeTruthy([page1AM, page3AM, page4AM, page5AM]);
      expect(page2AM).toBeNull();

      expect(page1AM.isEmpty).toBeTruthy();
      expect(page3AM.parent).toStrictEqual(page1AM._id);
      expect(page4AM.parent).toStrictEqual(page3AM._id);
      expect(page5AM.parent).toStrictEqual(page1AM._id);

      expect(page3AM.isEmpty).toBe(false);
    });

  });

  describe('should normalize only selected pages recursively (especially should NOT normalize non-selected ancestors)', () => {
    /*
     * # Test flow
     * - Existing pages
     *   - All pages are NOT normalized
     *   - A, B, C, and D are owned by "testUser1"
     *   A. /normalize_A_owned
     *   B. /normalize_A_owned/normalize_B_owned
     *   C. /normalize_A_owned/normalize_B_owned/normalize_C_owned
     *   D. /normalize_A_owned/normalize_B_owned/normalize_C_owned/normalize_D_owned
     *   E. /normalize_A_owned/normalize_B_owned/normalize_C_owned/normalize_D_root
     *     - Owned by "rootUser"
     *   F. /normalize_A_owned/normalize_B_owned/normalize_C_owned/normalize_D_group
     *     - Owned by the userGroup "groupIdIsolate"
     *
     * 1. Normalize A and B one by one.
     *   - Expect
     *     - A and B are normalized
     *     - C and D are NOT normalized
     *     - E and F are NOT normalized
     * 2. Recursively normalize D.
     *   - Expect
     *     - A, B, and D are normalized
     *     - C is NOT normalized
     *       - C is substituted by an empty page whose path is "/normalize_A_owned/normalize_B_owned/normalize_C_owned"
     *     - E and F are NOT normalized
     * 3. Recursively normalize C.
     *   - Expect
     *     - A, B, C, and D are normalized
     *     - An empty page at "/normalize_A_owned/normalize_B_owned/normalize_C_owned" does NOT exist (removed)
     *     - E and F are NOT normalized
     */

    const owned = filter => ({ grantedUsers: [testUser1._id], ...filter });
    const root = filter => ({ grantedUsers: [rootUser._id], ...filter });
    const rootUserGroup = filter => ({ grantedGroup: rootUserGroupId, ...filter });
    const testUser1Group = filter => ({ grantedGroup: testUser1GroupId, ...filter });

    const normalized = { parent: { $ne: null } };
    const notNormalized = { parent: null };
    const empty = { isEmpty: true };

    beforeAll(async() => {
      // Prepare data
      const id17 = new mongoose.Types.ObjectId();
      const id21 = new mongoose.Types.ObjectId();
      const id22 = new mongoose.Types.ObjectId();
      const id23 = new mongoose.Types.ObjectId();

      await Page.insertMany([
        // 1
        {
          path: '/normalize_13_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
        },
        {
          path: '/normalize_13_owned/normalize_14_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
        },
        {
          path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
        },
        {
          path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned/normalize_16_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
        },
        {
          path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned/normalize_16_root',
          grant: Page.GRANT_OWNER,
          grantedUsers: [rootUser._id],
        },
        {
          path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned/normalize_16_group',
          grant: Page.GRANT_USER_GROUP,
          grantedGroup: testUser1GroupId,
        },

        // 2
        {
          _id: id17,
          path: '/normalize_17_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
          parent: rootPage._id,
        },
        {
          path: '/normalize_17_owned/normalize_18_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
          parent: id17,
        },
        {
          path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
        },
        {
          path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned/normalize_20_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
        },
        {
          path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned/normalize_20_root',
          grant: Page.GRANT_OWNER,
          grantedUsers: [rootUser._id],
        },
        {
          path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned/normalize_20_group',
          grant: Page.GRANT_USER_GROUP,
          grantedGroup: rootUserGroupId,
        },

        // 3
        {
          _id: id21,
          path: '/normalize_21_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
          parent: rootPage._id,
        },
        {
          _id: id22,
          path: '/normalize_21_owned/normalize_22_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
          parent: id21,
        },
        {
          path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
          parent: null,
        },
        {
          _id: id23,
          path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned',
          isEmpty: true,
          parent: id22,
        },
        {
          path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned/normalize_24_owned',
          grant: Page.GRANT_OWNER,
          grantedUsers: [testUser1._id],
          parent: id23,
        },
        {
          path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned/normalize_24_root',
          grant: Page.GRANT_OWNER,
          grantedUsers: [rootUser._id],
        },
        {
          path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned/normalize_24_rootGroup',
          grant: Page.GRANT_USER_GROUP,
          grantedGroup: rootUserGroupId,
        },
      ]);
    });


    test('1', async() => {
      /*
       * 1
       */
      const _owned13 = await Page.findOne(owned({ path: '/normalize_13_owned', ...notNormalized }));
      const _owned14 = await Page.findOne(owned({ path: '/normalize_13_owned/normalize_14_owned', ...notNormalized }));
      const _owned15 = await Page.findOne(owned({ path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned', ...notNormalized }));
      const _owned16 = await Page.findOne(owned({ path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned/normalize_16_owned', ...notNormalized }));
      const _root16 = await Page.findOne(root({ path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned/normalize_16_root', ...notNormalized }));
      const _group16 = await Page.findOne(testUser1Group({ path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned/normalize_16_group', ...notNormalized }));

      expect(_owned13).not.toBeNull();
      expect(_owned14).not.toBeNull();
      expect(_owned15).not.toBeNull();
      expect(_owned16).not.toBeNull();
      expect(_root16).not.toBeNull();
      expect(_group16).not.toBeNull();

      // Normalize
      await normalizeParentByPageId(_owned13, testUser1);
      await normalizeParentByPageId(_owned14, testUser1);

      const owned13 = await Page.findOne({ path: '/normalize_13_owned' });
      const owned14 = await Page.findOne({ path: '/normalize_13_owned/normalize_14_owned' });
      const owned15 = await Page.findOne({ path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned' });
      const owned16 = await Page.findOne({ path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned/normalize_16_owned' });
      const root16 = await Page.findOne(root({ path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned/normalize_16_root' }));
      const group16 = await Page.findOne(testUser1Group({ path: '/normalize_13_owned/normalize_14_owned/normalize_15_owned/normalize_16_group' }));

      expect(owned13).not.toBeNull();
      expect(owned14).not.toBeNull();
      expect(owned15).not.toBeNull();
      expect(owned16).not.toBeNull();
      expect(root16).not.toBeNull();
      expect(group16).not.toBeNull();

      // Check parent
      expect(owned13.parent).toStrictEqual(rootPage._id);
      expect(owned14.parent).toStrictEqual(owned13._id);
      expect(owned15.parent).toBeNull();
      expect(owned16.parent).toBeNull();
      expect(root16.parent).toBeNull();
      expect(group16.parent).toBeNull();

      // Check isEmpty
      expect(owned13.isEmpty).toBe(false);
      expect(owned14.isEmpty).toBe(false);
    });

    test('2', async() => {
      /*
       * 2
       */
      const _owned17 = await Page.findOne(owned({ path: '/normalize_17_owned', ...normalized }));
      const _owned18 = await Page.findOne(owned({ path: '/normalize_17_owned/normalize_18_owned', ...normalized }));
      const _owned19 = await Page.findOne(owned({ path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned', ...notNormalized }));
      const _owned20 = await Page.findOne(owned({ path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned/normalize_20_owned', ...notNormalized }));
      const _root20 = await Page.findOne(root({ path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned/normalize_20_root', ...notNormalized }));
      const _group20 = await Page.findOne(rootUserGroup({ path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned/normalize_20_group', ...notNormalized }));

      expect(_owned17).not.toBeNull();
      expect(_owned18).not.toBeNull();
      expect(_owned19).not.toBeNull();
      expect(_owned20).not.toBeNull();
      expect(_root20).not.toBeNull();
      expect(_group20).not.toBeNull();

      // Normalize
      await normalizeParentRecursivelyByPages([_owned20], testUser1);

      const owned17 = await Page.findOne({ path: '/normalize_17_owned' });
      const owned18 = await Page.findOne({ path: '/normalize_17_owned/normalize_18_owned' });
      const owned19 = await Page.findOne({ path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned' });
      const empty19 = await Page.findOne({ path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned', ...empty });
      const owned20 = await Page.findOne({ path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned/normalize_20_owned' });
      const root20 = await Page.findOne(root({ path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned/normalize_20_root' }));
      const group20 = await Page.findOne(rootUserGroup({ path: '/normalize_17_owned/normalize_18_owned/normalize_19_owned/normalize_20_group' }));

      expect(owned17).not.toBeNull();
      expect(owned18).not.toBeNull();
      expect(owned19).not.toBeNull();
      expect(empty19).not.toBeNull();
      expect(owned20).not.toBeNull();
      expect(root20).not.toBeNull();
      expect(group20).not.toBeNull();

      // Check parent
      expect(owned17.parent).toStrictEqual(rootPage._id);
      expect(owned18.parent).toStrictEqual(owned17._id);
      expect(owned19.parent).toBeNull();
      expect(empty19.parent).toStrictEqual(owned18._id);
      expect(owned20.parent).toStrictEqual(empty19._id);
      expect(root20.parent).toBeNull();
      expect(group20.parent).toBeNull();

      // Check isEmpty
      expect(owned17.isEmpty).toBe(false);
      expect(owned18.isEmpty).toBe(false);
    });

    test('3', async() => {
      /*
       * 3
       */
      const _owned21 = await Page.findOne(owned({ path: '/normalize_21_owned', ...normalized }));
      const _owned22 = await Page.findOne(owned({ path: '/normalize_21_owned/normalize_22_owned', ...normalized }));
      const _owned23 = await Page.findOne(owned({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned', ...notNormalized }));
      const _empty23 = await Page.findOne({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned', ...normalized, ...empty });
      const _owned24 = await Page.findOne(owned({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned/normalize_24_owned', ...normalized }));
      const _root24 = await Page.findOne(root({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned/normalize_24_root', ...notNormalized }));
      const _rootGroup24 = await Page.findOne(rootUserGroup({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned/normalize_24_rootGroup', ...notNormalized }));

      expect(_owned21).not.toBeNull();
      expect(_owned22).not.toBeNull();
      expect(_owned23).not.toBeNull();
      expect(_empty23).not.toBeNull();
      expect(_owned24).not.toBeNull();
      expect(_root24).not.toBeNull();
      expect(_rootGroup24).not.toBeNull();

      // Normalize
      await normalizeParentRecursivelyByPages([_owned23], testUser1);

      const owned21 = await Page.findOne({ path: '/normalize_21_owned' });
      const owned22 = await Page.findOne({ path: '/normalize_21_owned/normalize_22_owned' });
      const owned23 = await Page.findOne({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned' });
      const empty23 = await Page.findOne({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned', ...empty });
      const owned24 = await Page.findOne({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned/normalize_24_owned' });
      const root24 = await Page.findOne(root({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned/normalize_24_root' }));
      const rootGroup24 = await Page.findOne(rootUserGroup({ path: '/normalize_21_owned/normalize_22_owned/normalize_23_owned/normalize_24_rootGroup' }));

      expect(owned21).not.toBeNull();
      expect(owned22).not.toBeNull();
      expect(owned23).not.toBeNull();
      expect(empty23).toBeNull(); // removed
      expect(owned24).not.toBeNull();
      expect(root24).not.toBeNull();
      expect(rootGroup24).not.toBeNull();

      // Check parent
      expect(owned21.parent).toStrictEqual(rootPage._id);
      expect(owned22.parent).toStrictEqual(owned21._id);
      expect(owned23.parent).toStrictEqual(owned22._id);
      expect(owned24.parent).toStrictEqual(owned23._id); // not empty23._id
      expect(root24.parent).toBeNull();
      expect(rootGroup24.parent).toBeNull(); // excluded from the pages to be normalized

      // Check isEmpty
      expect(owned21.isEmpty).toBe(false);
      expect(owned22.isEmpty).toBe(false);
      expect(owned23.isEmpty).toBe(false);
    });

  });

  describe('normalizeAllPublicPages()', () => {
    jest.setTimeout(60000);
    let createPagePaths;
    let allPossiblePagePaths;
    beforeAll(async() => {
      createPagePaths = [
        '/publicA', '/publicA/privateB', '/publicA/privateB/publicC', '/parenthesis/(a)[b]{c}d', '/parenthesis/(a)[b]{c}d/public', '/migratedD',
      ];
      allPossiblePagePaths = [...createPagePaths, '/parenthesis', '/'];

      // initialize pages for test
      await Page.insertMany([
        {
          path: '/publicA',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
        {
          path: '/publicA/privateB',
          grant: Page.GRANT_OWNER,
          creator: testUser1,
          lastUpdateUser: testUser1,
          grantedUsers: [testUser1._id],
        },
        {
          path: '/publicA/privateB/publicC',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
        {
          path: '/parenthesis/(a)[b]{c}d',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
        {
          path: '/parenthesis/(a)[b]{c}d/public',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
      ]);

      const parent = await Page.find({ path: '/' });
      await Page.insertMany([
        {
          path: '/migratedD',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
          parent: parent._id,
        },
      ]);

      // migrate
      await crowi.pageService.normalizeAllPublicPages(Page.GRANT_PUBLIC);
      jest.setTimeout(30000);
    });

    test('should migrate all public pages', async() => {
      const migratedPages = await Page.find({
        path: {
          $in: allPossiblePagePaths,
        },
        parent: { $ne: null },
      });
      const migratedEmptyPages = await Page.find({
        path: {
          $in: allPossiblePagePaths,
        },
        isEmpty: true,
        parent: { $ne: null },
      });
      const nonMigratedPages = await Page.find({
        path: {
          $in: allPossiblePagePaths,
        },
        parent: null,
      });

      const migratedPaths = migratedPages.map(page => page.path).sort();
      const migratedEmptyPaths = migratedEmptyPages.map(page => page.path).sort();
      const nonMigratedPaths = nonMigratedPages.map(page => page.path).sort();

      const expectedMigratedPaths = allPossiblePagePaths.filter(path => path !== '/').sort();
      const expectedMigratedEmptyPaths = ['/publicA/privateB', '/parenthesis'].sort();
      const expectedNonMigratedPaths = ['/publicA/privateB', '/'].sort();

      expect(migratedPaths).toStrictEqual(expectedMigratedPaths);
      expect(migratedEmptyPaths).toStrictEqual(expectedMigratedEmptyPaths);
      expect(nonMigratedPaths).toStrictEqual(expectedNonMigratedPaths);
    });
  });

  describe('normalizeParentByPageId()', () => {
    test('it should normalize not v5 page with usergroup that has parent group', async() => {
      const page1 = await Page.findOne({ _id: pageId1, path: '/normalize_1', isEmpty: true });
      const page2 = await Page.findOne({ _id: pageId2, path: '/normalize_1/normalize_2', parent: page1._id });
      const page3 = await Page.findOne({ _id: pageId3, path: '/normalize_1' }); // NOT v5
      expectAllToBeTruthy([page1, page2, page3]);

      await normalizeParentByPageId(page3, testUser1);

      // AM => After Migration
      const page1AM = await Page.findOne({ _id: pageId1, path: '/normalize_1', isEmpty: true });
      const page2AM = await Page.findOne({ _id: pageId2, path: '/normalize_1/normalize_2' });
      const page3AM = await Page.findOne({ _id: pageId3, path: '/normalize_1' }); // v5 compatible
      expectAllToBeTruthy([page2AM, page3AM]);
      expect(page1AM).toBeNull();

      expect(page2AM.parent).toStrictEqual(page3AM._id);
      expect(page3AM.parent).toStrictEqual(rootPage._id);
    });

    test('should throw error if a page with isolated group becomes the parent of other page with different gourp after normalizing', async() => {
      const page4 = await Page.findOne({ _id: pageId4, path: '/normalize_4', isEmpty: true });
      const page5 = await Page.findOne({ _id: pageId5, path: '/normalize_4/normalize_5', parent: page4._id });
      const page6 = await Page.findOne({ _id: pageId6, path: '/normalize_4' }); // NOT v5

      expectAllToBeTruthy([page4, page5, page6]);

      let isThrown;
      try {
        await normalizeParentByPageId(page6, testUser1);
      }
      catch (err) {
        isThrown = true;
      }

      // AM => After Migration
      const page4AM = await Page.findOne({ _id: pageId4, path: '/normalize_4', isEmpty: true });
      const page5AM = await Page.findOne({ _id: pageId5, path: '/normalize_4/normalize_5', parent: page4._id });
      const page6AM = await Page.findOne({ _id: pageId6, path: '/normalize_4' }); // NOT v5
      expectAllToBeTruthy([page4AM, page5AM, page6AM]);

      expect(isThrown).toBe(true);
      expect(page4AM).toStrictEqual(page4);
      expect(page5AM).toStrictEqual(page5);
      expect(page6AM).toStrictEqual(page6);
    });
  });

  test('replace private parents with empty pages', async() => {
    const replacedPathPages = await Page.find({ path: '/publicA/privateB' }); // ex-private page

    const _newEmptyPage = replacedPathPages.filter(page => page.parent != null)[0];
    const newEmptyPage = {
      path: _newEmptyPage.path,
      grant: _newEmptyPage.grant,
      isEmpty: _newEmptyPage.isEmpty,
    };
    const expectedNewEmptyPage = {
      path: '/publicA/privateB',
      grant: Page.GRANT_PUBLIC,
      isEmpty: true,
    };

    const _privatePage = replacedPathPages.filter(page => page.parent == null)[0];
    const privatePage = {
      path: _privatePage.path,
      grant: _privatePage.grant,
      isEmpty: _privatePage.isEmpty,
    };
    const expectedPrivatePage = {
      path: '/publicA/privateB',
      grant: Page.GRANT_OWNER,
      isEmpty: false,
    };

    expect(replacedPathPages.length).toBe(2);
    expect(newEmptyPage).toStrictEqual(expectedNewEmptyPage);
    expect(privatePage).toStrictEqual(expectedPrivatePage);
  });

});
