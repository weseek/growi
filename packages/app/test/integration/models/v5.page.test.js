import mongoose from 'mongoose';


import { getInstance } from '../setup-crowi';

describe('Page', () => {
  let crowi;
  let Page;
  let Revision;
  let User;
  let PageTagRelation;
  let Bookmark;
  let Comment;
  let ShareLink;
  let PageRedirect;
  let UserGroup;
  let UserGroupRelation;
  let xssSpy;

  let rootPage;
  let dummyUser1;
  let pModelUser1;
  let pModelUser2;
  let pModelUser3;
  let groupIdIsolate;
  let groupIdA;
  let groupIdB;
  let groupIdC;

  beforeAll(async() => {
    crowi = await getInstance();
    await crowi.configManager.updateConfigsInTheSameNamespace('crowi', { 'app:isV5Compatible': true });

    jest.restoreAllMocks();
    User = mongoose.model('User');
    Page = mongoose.model('Page');
    Revision = mongoose.model('Revision');
    PageTagRelation = mongoose.model('PageTagRelation');
    Bookmark = mongoose.model('Bookmark');
    Comment = mongoose.model('Comment');
    ShareLink = mongoose.model('ShareLink');
    PageRedirect = mongoose.model('PageRedirect');
    UserGroup = mongoose.model('UserGroup');
    UserGroupRelation = mongoose.model('UserGroupRelation');

    dummyUser1 = await User.findOne({ username: 'v5DummyUser1' });

    rootPage = await Page.findOne({ path: '/' });

    const pModelUserId1 = new mongoose.Types.ObjectId();
    const pModelUserId2 = new mongoose.Types.ObjectId();
    const pModelUserId3 = new mongoose.Types.ObjectId();
    await User.insertMany([
      {
        _id: pModelUserId1,
        name: 'pmodelUser1',
        username: 'pmodelUser1',
        email: 'pmodelUser1@example.com',
      },
      {
        _id: pModelUserId2,
        name: 'pmodelUser2',
        username: 'pmodelUser2',
        email: 'pmodelUser2@example.com',
      },
      {
        _id: pModelUserId3,
        name: 'pModelUser3',
        username: 'pModelUser3',
        email: 'pModelUser3@example.com',
      },
    ]);
    pModelUser1 = await User.findOne({ _id: pModelUserId1 });
    pModelUser2 = await User.findOne({ _id: pModelUserId2 });
    pModelUser3 = await User.findOne({ _id: pModelUserId3 });


    groupIdIsolate = new mongoose.Types.ObjectId();
    groupIdA = new mongoose.Types.ObjectId();
    groupIdB = new mongoose.Types.ObjectId();
    groupIdC = new mongoose.Types.ObjectId();
    await UserGroup.insertMany([
      {
        _id: groupIdIsolate,
        name: 'pModel_groupIsolate',
      },
      {
        _id: groupIdA,
        name: 'pModel_groupA',
      },
      {
        _id: groupIdB,
        name: 'pModel_groupB',
        parent: groupIdA,
      },
      {
        _id: groupIdC,
        name: 'pModel_groupC',
        parent: groupIdB,
      },
    ]);

    await UserGroupRelation.insertMany([
      {
        relatedGroup: groupIdIsolate,
        relatedUser: pModelUserId1,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdIsolate,
        relatedUser: pModelUserId2,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdA,
        relatedUser: pModelUserId1,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdA,
        relatedUser: pModelUserId2,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdA,
        relatedUser: pModelUserId3,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdB,
        relatedUser: pModelUserId2,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdB,
        relatedUser: pModelUserId3,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdC,
        relatedUser: pModelUserId3,
        createdAt: new Date(),
      },
    ]);

    /**
     * update
     * mup_ => model update
     * emp => empty => page with isEmpty: true
     * pub => public => GRANT_PUBLIC
     * awl => Anyone with the link => GRANT_RESTRICTED
     */
    const pageIdUpd1 = new mongoose.Types.ObjectId();
    const pageIdUpd2 = new mongoose.Types.ObjectId();
    const pageIdUpd3 = new mongoose.Types.ObjectId();
    const pageIdUpd4 = new mongoose.Types.ObjectId();
    const pageIdUpd5 = new mongoose.Types.ObjectId();
    const pageIdUpd6 = new mongoose.Types.ObjectId();
    const pageIdUpd7 = new mongoose.Types.ObjectId();
    const pageIdUpd8 = new mongoose.Types.ObjectId();
    const pageIdUpd9 = new mongoose.Types.ObjectId();
    const pageIdUpd10 = new mongoose.Types.ObjectId();
    const pageIdUpd11 = new mongoose.Types.ObjectId();
    const pageIdUpd12 = new mongoose.Types.ObjectId();
    const pageIdUpd13 = new mongoose.Types.ObjectId();
    const pageIdUpd14 = new mongoose.Types.ObjectId();
    const pageIdUpd15 = new mongoose.Types.ObjectId();
    const pageIdUpd16 = new mongoose.Types.ObjectId();
    const pageIdUpd17 = new mongoose.Types.ObjectId();
    const pageIdUpd18 = new mongoose.Types.ObjectId();
    const pageIdUpd19 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        _id: pageIdUpd1,
        path: '/mup13_top/mup1_emp',
        grant: Page.GRANT_PUBLIC,
        parent: pageIdUpd8._id,
        isEmpty: true,
      },
      {
        _id: pageIdUpd2,
        path: '/mup13_top/mup1_emp/mup2_pub',
        grant: Page.GRANT_PUBLIC,
        parent: pageIdUpd1._id,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
      },
      {
        _id: pageIdUpd3,
        path: '/mup14_top/mup6_pub',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdUpd9,
        isEmpty: false,
        descendantCount: 1,
      },
      {
        path: '/mup14_top/mup6_pub/mup7_pub',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdUpd3,
        isEmpty: false,
        descendantCount: 0,
      },
      {
        _id: pageIdUpd4,
        path: '/mup15_top/mup8_pub',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdUpd10._id,
        isEmpty: false,
      },
      {
        _id: pageIdUpd5,
        path: '/mup16_top/mup9_pub/mup10_pub/mup11_awl',
        grant: Page.GRANT_RESTRICTED,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
      },
      {
        _id: pageIdUpd6,
        path: '/mup17_top/mup12_emp',
        isEmpty: true,
        parent: pageIdUpd12._id,
        descendantCount: 1,
      },
      {
        _id: pageIdUpd7,
        path: '/mup17_top/mup12_emp',
        grant: Page.GRANT_RESTRICTED,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
      },
      {
        path: '/mup17_top/mup12_emp/mup18_pub',
        isEmpty: false,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdUpd6._id,
      },
      {
        _id: pageIdUpd8,
        path: '/mup13_top',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 2,
      },
      {
        _id: pageIdUpd9,
        path: '/mup14_top',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 2,
      },
      {
        _id: pageIdUpd10,
        path: '/mup15_top',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 1,
      },
      {
        _id: pageIdUpd11,
        path: '/mup16_top',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 0,
      },
      {
        _id: pageIdUpd12,
        path: '/mup17_top',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 1,
      },
      {
        path: '/mup19',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 0,
      },
      {
        path: '/mup20',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 0,
      },
      {
        path: '/mup21',
        grant: Page.GRANT_RESTRICTED,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        descendantCount: 0,
      },
      {
        _id: pageIdUpd13,
        path: '/mup22',
        grant: Page.GRANT_PUBLIC,
        creator: pModelUser1,
        lastUpdateUser: pModelUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 1,
      },
      {
        path: '/mup22/mup23',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: pageIdUpd13,
        descendantCount: 0,
      },
      {
        _id: pageIdUpd14,
        path: '/mup24_pub',
        grant: Page.GRANT_PUBLIC,
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: rootPage,
        descendantCount: 1,
      },
      {
        path: '/mup24_pub/mup25_pub',
        grant: Page.GRANT_PUBLIC,
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: pageIdUpd14,
        descendantCount: 0,
      },
      {
        path: '/mup26_awl',
        grant: Page.GRANT_RESTRICTED,
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        descendantCount: 0,
      },
      {
        _id: pageIdUpd15,
        path: '/mup27_pub',
        grant: Page.GRANT_PUBLIC,
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: rootPage,
        descendantCount: 1,
      },
      {
        path: '/mup27_pub/mup28_owner',
        grant: Page.GRANT_OWNER,
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: pageIdUpd15,
        grantedUsers: [pModelUserId1],
        descendantCount: 0,
      },
      {
        _id: pageIdUpd16,
        path: '/mup29_A',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: rootPage,
        descendantCount: 1,
      },
      {
        path: '/mup29_A/mup30_owner',
        grant: Page.GRANT_OWNER,
        grantedUsers: [pModelUserId1],
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: pageIdUpd16,
        descendantCount: 0,
      },
      {
        _id: pageIdUpd17,
        path: '/mup31_A',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: rootPage,
        descendantCount: 1,
      },
      {
        path: '/mup31_A/mup32_owner',
        grant: Page.GRANT_OWNER,
        grantedUsers: [pModelUserId1],
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: pageIdUpd17,
        descendantCount: 0,
      },
      {
        _id: pageIdUpd18,
        path: '/mup33_C',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdC,
        creator: pModelUserId3,
        lastUpdateUser: pModelUserId3,
        isEmpty: false,
        parent: rootPage,
        descendantCount: 1,
      },
      {
        path: '/mup33_C/mup34_owner',
        grant: Page.GRANT_OWNER,
        grantedUsers: [pModelUserId3],
        creator: pModelUserId3,
        lastUpdateUser: pModelUserId3,
        isEmpty: false,
        parent: pageIdUpd18,
        descendantCount: 0,
      },
      {
        _id: pageIdUpd19,
        path: '/mup35_owner',
        grant: Page.GRANT_OWNER,
        grantedUsers: [pModelUserId1],
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: rootPage,
        descendantCount: 1,
      },
      {
        path: '/mup35_owner/mup36_owner',
        grant: Page.GRANT_OWNER,
        grantedUsers: [pModelUserId1],
        creator: pModelUserId1,
        lastUpdateUser: pModelUserId1,
        isEmpty: false,
        parent: pageIdUpd19,
        descendantCount: 0,
      },
      {
        path: '/mup40', // used this number to resolve conflict
        grant: Page.GRANT_OWNER,
        grantedUsers: [dummyUser1._id],
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 0,
      },
    ]);

  });

  describe('update', () => {

    const updatePage = async(page, newRevisionBody, oldRevisionBody, user, options = {}) => {
      const mockedRenameSubOperation = jest.spyOn(Page, 'emitPageEventUpdate').mockReturnValue(null);
      const savedPage = await Page.updatePage(page, newRevisionBody, oldRevisionBody, user, options);
      mockedRenameSubOperation.mockRestore();
      return savedPage;
    };

    describe('Changing grant from PUBLIC to RESTRICTED of', () => {
      test('an only-child page will delete its empty parent page', async() => {
        const pathT = '/mup13_top';
        const path1 = '/mup13_top/mup1_emp';
        const path2 = '/mup13_top/mup1_emp/mup2_pub';
        const pageT = await Page.findOne({ path: pathT, descendantCount: 2 });
        const page1 = await Page.findOne({ path: path1, isEmpty: true });
        const page2 = await Page.findOne({ path: path2, grant: Page.GRANT_PUBLIC });
        expect(pageT).toBeTruthy();
        expect(page1).toBeTruthy();
        expect(page2).toBeTruthy();

        const options = { grant: Page.GRANT_RESTRICTED, grantUserGroupId: null };
        await Page.updatePage(page2, 'newRevisionBody', 'oldRevisionBody', dummyUser1, options);

        const _pageT = await Page.findOne({ path: pathT });
        const _page1 = await Page.findOne({ path: path1 });
        const _page2 = await Page.findOne({ path: path2, grant: Page.GRANT_RESTRICTED });
        expect(_pageT).toBeTruthy();
        expect(_page1).toBeNull();
        expect(_page2).toBeTruthy();
        expect(_pageT.descendantCount).toBe(1);
      });
      test('a page that has children will create an empty page with the same path and it becomes a new parent', async() => {
        const pathT = '/mup14_top';
        const path1 = '/mup14_top/mup6_pub';
        const path2 = '/mup14_top/mup6_pub/mup7_pub';
        const top = await Page.findOne({ path: pathT, descendantCount: 2 });
        const page1 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC });
        const page2 = await Page.findOne({ path: path2, grant: Page.GRANT_PUBLIC });
        expect(top).toBeTruthy();
        expect(page1).toBeTruthy();
        expect(page2).toBeTruthy();

        await Page.updatePage(page1, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: Page.GRANT_RESTRICTED });

        const _top = await Page.findOne({ path: pathT });
        const _page1 = await Page.findOne({ path: path1, grant: Page.GRANT_RESTRICTED });
        const _page2 = await Page.findOne({ path: path2 });
        const _pageN = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC });
        expect(_page1).toBeTruthy();
        expect(_page2).toBeTruthy();
        expect(_pageN).toBeTruthy();

        expect(_page1.parent).toBeNull();
        expect(_page2.parent).toStrictEqual(_pageN._id);
        expect(_pageN.parent).toStrictEqual(top._id);
        expect(_pageN.isEmpty).toBe(true);
        expect(_pageN.descendantCount).toBe(1);
        expect(_top.descendantCount).toBe(1);
      });
      test('of a leaf page will NOT have an empty page with the same path', async() => {
        const pathT = '/mup15_top';
        const path1 = '/mup15_top/mup8_pub';
        const pageT = await Page.findOne({ path: pathT, descendantCount: 1 });
        const page1 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC });
        const count = await Page.count({ path: path1 });
        expect(pageT).toBeTruthy();
        expect(page1).toBeTruthy();
        expect(count).toBe(1);

        await Page.updatePage(page1, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: Page.GRANT_RESTRICTED });

        const _pageT = await Page.findOne({ path: pathT });
        const _page1 = await Page.findOne({ path: path1, grant: Page.GRANT_RESTRICTED });
        const _pageNotExist = await Page.findOne({ path: path1, isEmpty: true });
        expect(_pageT).toBeTruthy();
        expect(_page1).toBeTruthy();
        expect(_pageNotExist).toBeNull();
        expect(_pageT.descendantCount).toBe(0);
      });
    });

    describe('Changing grant to GRANT_RESTRICTED', () => {
      test('successfully change to GRANT_RESTRICTED from GRANT_OWNER', async() => {
        const path = '/mup40';
        const _page = await Page.findOne({ path, grant: Page.GRANT_OWNER, grantedUsers: [dummyUser1._id] });
        expect(_page).toBeTruthy();

        await updatePage(_page, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: Page.GRANT_RESTRICTED });

        const page = await Page.findOne({ path });
        expect(page).toBeTruthy();
        expect(page.grant).toBe(Page.GRANT_RESTRICTED);
        expect(page.grantedUsers).toStrictEqual([]);
      });
    });

    describe('Changing grant from RESTRICTED to PUBLIC of', () => {
      test('a page will create ancestors if they do not exist', async() => {
        const pathT = '/mup16_top';
        const path1 = '/mup16_top/mup9_pub';
        const path2 = '/mup16_top/mup9_pub/mup10_pub';
        const path3 = '/mup16_top/mup9_pub/mup10_pub/mup11_awl';
        const top = await Page.findOne({ path: pathT });
        const page1 = await Page.findOne({ path: path1 });
        const page2 = await Page.findOne({ path: path2 });
        const page3 = await Page.findOne({ path: path3, grant: Page.GRANT_RESTRICTED });
        expect(top).toBeTruthy();
        expect(page3).toBeTruthy();
        expect(page1).toBeNull();
        expect(page2).toBeNull();

        await Page.updatePage(page3, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: Page.GRANT_PUBLIC });

        const _pageT = await Page.findOne({ path: pathT });
        const _page1 = await Page.findOne({ path: path1, isEmpty: true });
        const _page2 = await Page.findOne({ path: path2, isEmpty: true });
        const _page3 = await Page.findOne({ path: path3, grant: Page.GRANT_PUBLIC });
        expect(_page1).toBeTruthy();
        expect(_page2).toBeTruthy();
        expect(_page3).toBeTruthy();
        expect(_page1.parent).toStrictEqual(top._id);
        expect(_page2.parent).toStrictEqual(_page1._id);
        expect(_page3.parent).toStrictEqual(_page2._id);
        expect(_pageT.descendantCount).toBe(1);
      });
      test('a page will replace an empty page with the same path if any', async() => {
        const pathT = '/mup17_top';
        const path1 = '/mup17_top/mup12_emp';
        const path2 = '/mup17_top/mup12_emp/mup18_pub';
        const pageT = await Page.findOne({ path: pathT, descendantCount: 1 });
        const page1 = await Page.findOne({ path: path1, isEmpty: true });
        const page2 = await Page.findOne({ path: path1, grant: Page.GRANT_RESTRICTED, isEmpty: false });
        const page3 = await Page.findOne({ path: path2 });
        expect(pageT).toBeTruthy();
        expect(page1).toBeTruthy();
        expect(page2).toBeTruthy();
        expect(page3).toBeTruthy();

        await Page.updatePage(page2, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: Page.GRANT_PUBLIC });

        const _pageT = await Page.findOne({ path: pathT });
        const _page1 = await Page.findOne({ path: path1, isEmpty: true }); // should be replaced
        const _page2 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC });
        const _page3 = await Page.findOne({ path: path2 });
        expect(_pageT).toBeTruthy();
        expect(_page1).toBeNull();
        expect(_page2).toBeTruthy();
        expect(_page3).toBeTruthy();
        expect(_page2.grant).toBe(Page.GRANT_PUBLIC);
        expect(_page2.parent).toStrictEqual(_pageT._id);
        expect(_page3.parent).toStrictEqual(_page2._id);
        expect(_pageT.descendantCount).toBe(2);
      });
    });

    describe('Changing grant to GRANT_OWNER(onlyme)', () => {
      test('successfully change to GRANT_OWNER from GRANT_PUBLIC', async() => {
        const path = '/mup19';
        const _page = await Page.findOne({ path, grant: Page.GRANT_PUBLIC });
        expect(_page).toBeTruthy();

        await updatePage(_page, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: Page.GRANT_OWNER });

        const page = await Page.findOne({ path });
        expect(page.grant).toBe(Page.GRANT_OWNER);
        expect(page.grantedUsers).toStrictEqual([dummyUser1._id]);

      });
      test('successfully change to GRANT_OWNER from GRANT_USER_GROUP', async() => {
        const path = '/mup20';
        const _page = await Page.findOne({ path, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdA });
        expect(_page).toBeTruthy();

        await updatePage(_page, 'newRevisionBody', 'oldRevisionBody', pModelUser1, { grant: Page.GRANT_OWNER });

        const page = await Page.findOne({ path });
        expect(page.grant).toBe(Page.GRANT_OWNER);
        expect(page.grantedUsers).toStrictEqual([pModelUser1._id]);
        expect(page.grantedGroup).toBeNull();
      });
      test('successfully change to GRANT_OWNER from GRANT_RESTRICTED', async() => {
        const path = '/mup21';
        const _page = await Page.findOne({ path, grant: Page.GRANT_RESTRICTED });
        expect(_page).toBeTruthy();

        await updatePage(_page, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: Page.GRANT_OWNER });

        const page = await Page.findOne({ path });
        expect(page.grant).toBe(Page.GRANT_OWNER);
        expect(page.grantedUsers).toStrictEqual([dummyUser1._id]);
      });
      test('Failed to change to GRANT_OWNER if one of the ancestors is GRANT_USER_GROUP page', async() => {
        const path1 = '/mup22';
        const path2 = '/mup22/mup23';
        const _page1 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC });
        const _page2 = await Page.findOne({ path: path2, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdA });
        expect(_page1).toBeTruthy();
        expect(_page2).toBeTruthy();

        await expect(updatePage(_page1, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: Page.GRANT_OWNER }))
          .rejects.toThrow(new Error('The selected grant or grantedGroup is not assignable to this page.'));

        const page1 = await Page.findOne({ path1 });
        expect(page1).toBeTruthy();
        expect(page1.grant).toBe(Page.GRANT_PUBLIC);
        expect(page1.grantedUsers).not.toStrictEqual([dummyUser1._id]);
      });
    });
    describe('Changing grant to GRANT_USER_GROUP', () => {
      describe('update grant of a page under a page with GRANT_PUBLIC', () => {
        test('successfully change to GRANT_USER_GROUP from GRANT_PUBLIC if parent page is GRANT_PUBLIC', async() => {
          // path
          const path1 = '/mup24_pub';
          const path2 = '/mup24_pub/mup25_pub';
          // page
          const _page1 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC }); // out of update scope
          const _page2 = await Page.findOne({ path: path2, grant: Page.GRANT_PUBLIC, parent: _page1._id }); // update target
          expect(_page1).toBeTruthy();
          expect(_page2).toBeTruthy();

          const options = { grant: Page.GRANT_USER_GROUP, grantUserGroupId: groupIdA };
          const updatedPage = await updatePage(_page2, 'new', 'old', pModelUser1, options); // from GRANT_PUBLIC to GRANT_USER_GROUP(groupIdA)

          const page1 = await Page.findById(_page1._id);
          const page2 = await Page.findById(_page2._id);
          expect(page1).toBeTruthy();
          expect(page2).toBeTruthy();
          expect(updatedPage).toBeTruthy();
          expect(updatedPage._id).toStrictEqual(page2._id);

          // check page2 grant and group
          expect(page2.grant).toBe(Page.GRANT_USER_GROUP);
          expect(page2.grantedGroup._id).toStrictEqual(groupIdA);
        });

        test('successfully change to GRANT_USER_GROUP from GRANT_RESTRICTED if parent page is GRANT_PUBLIC', async() => {
          // path
          const _path1 = '/mup26_awl';
          // page
          const _page1 = await Page.findOne({ path: _path1, grant: Page.GRANT_RESTRICTED });
          expect(_page1).toBeTruthy();

          const options = { grant: Page.GRANT_USER_GROUP, grantUserGroupId: groupIdA };
          const updatedPage = await updatePage(_page1, 'new', 'old', pModelUser1, options); // from GRANT_RESTRICTED to GRANT_USER_GROUP(groupIdA)

          const page1 = await Page.findById(_page1._id);
          expect(page1).toBeTruthy();
          expect(updatedPage).toBeTruthy();
          expect(updatedPage._id).toStrictEqual(page1._id);

          // updated page
          expect(page1.grant).toBe(Page.GRANT_USER_GROUP);
          expect(page1.grantedGroup._id).toStrictEqual(groupIdA);

          // parent's grant check
          const parent = await Page.findById(page1.parent);
          expect(parent.grant).toBe(Page.GRANT_PUBLIC);

        });

        test('successfully change to GRANT_USER_GROUP from GRANT_OWNER if parent page is GRANT_PUBLIC', async() => {
          // path
          const path1 = '/mup27_pub';
          const path2 = '/mup27_pub/mup28_owner';
          // page
          const _page1 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC }); // out of update scope
          const _page2 = await Page.findOne({
            path: path2, grant: Page.GRANT_OWNER, grantedUsers: [pModelUser1], parent: _page1._id,
          }); // update target
          expect(_page1).toBeTruthy();
          expect(_page2).toBeTruthy();

          const options = { grant: Page.GRANT_USER_GROUP, grantUserGroupId: groupIdA };
          const updatedPage = await updatePage(_page2, 'new', 'old', pModelUser1, options); // from GRANT_OWNER to GRANT_USER_GROUP(groupIdA)

          const page1 = await Page.findById(_page1._id);
          const page2 = await Page.findById(_page2._id);
          expect(page1).toBeTruthy();
          expect(page2).toBeTruthy();
          expect(updatedPage).toBeTruthy();
          expect(updatedPage._id).toStrictEqual(page2._id);

          // grant check
          expect(page2.grant).toBe(Page.GRANT_USER_GROUP);
          expect(page2.grantedGroup._id).toStrictEqual(groupIdA);
          expect(page2.grantedUsers.length).toBe(0);
        });
      });
      describe('update grant of a page under a page with GRANT_USER_GROUP', () => {
        test('successfully change to GRANT_USER_GROUP if the group to set is the child or descendant of the parent page group', async() => {
          // path
          const _path1 = '/mup29_A';
          const _path2 = '/mup29_A/mup30_owner';
          // page
          const _page1 = await Page.findOne({ path: _path1, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdA }); // out of update scope
          const _page2 = await Page.findOne({ // update target
            path: _path2, grant: Page.GRANT_OWNER, grantedUsers: [pModelUser1], parent: _page1._id,
          });
          expect(_page1).toBeTruthy();
          expect(_page2).toBeTruthy();

          const options = { grant: Page.GRANT_USER_GROUP, grantUserGroupId: groupIdB };

          // First round
          // Group relation(parent -> child): groupIdA -> groupIdB -> groupIdC
          const updatedPage = await updatePage(_page2, 'new', 'old', pModelUser3, options); // from GRANT_OWNER to GRANT_USER_GROUP(groupIdB)

          const page1 = await Page.findById(_page1._id);
          const page2 = await Page.findById(_page2._id);
          expect(page1).toBeTruthy();
          expect(page2).toBeTruthy();
          expect(updatedPage).toBeTruthy();
          expect(updatedPage._id).toStrictEqual(page2._id);

          expect(page2.grant).toBe(Page.GRANT_USER_GROUP);
          expect(page2.grantedGroup._id).toStrictEqual(groupIdB);
          expect(page2.grantedUsers.length).toBe(0);

          // Second round
          // Update group to groupC which is a grandchild from pageA's point of view
          const secondRoundOptions = { grant: Page.GRANT_USER_GROUP, grantUserGroupId: groupIdC }; // from GRANT_USER_GROUP(groupIdB) to GRANT_USER_GROUP(groupIdC)
          const secondRoundUpdatedPage = await updatePage(_page2, 'new', 'new', pModelUser3, secondRoundOptions);

          expect(secondRoundUpdatedPage).toBeTruthy();
          expect(secondRoundUpdatedPage.grant).toBe(Page.GRANT_USER_GROUP);
          expect(secondRoundUpdatedPage.grantedGroup._id).toStrictEqual(groupIdC);
        });
        test('Fail to change to GRANT_USER_GROUP if the group to set is NOT the child or descendant of the parent page group', async() => {
          // path
          const _path1 = '/mup31_A';
          const _path2 = '/mup31_A/mup32_owner';
          // page
          const _page1 = await Page.findOne({ path: _path1, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdA });
          const _page2 = await Page.findOne({ // update target
            path: _path2, grant: Page.GRANT_OWNER, grantedUsers: [pModelUser1._id], parent: _page1._id,
          });
          expect(_page1).toBeTruthy();
          expect(_page2).toBeTruthy();

          // group
          const _groupIsolated = await UserGroup.findById(groupIdIsolate);
          expect(_groupIsolated).toBeTruthy();
          // group parent check
          expect(_groupIsolated.parent).toBeUndefined(); // should have no parent

          const options = { grant: Page.GRANT_USER_GROUP, grantUserGroupId: groupIdIsolate };
          await expect(updatePage(_page2, 'new', 'old', pModelUser1, options)) // from GRANT_OWNER to GRANT_USER_GROUP(groupIdIsolate)
            .rejects.toThrow(new Error('The selected grant or grantedGroup is not assignable to this page.'));

          const page1 = await Page.findById(_page1._id);
          const page2 = await Page.findById(_page2._id);
          expect(page1).toBeTruthy();
          expect(page1).toBeTruthy();

          expect(page2.grant).toBe(Page.GRANT_OWNER); // should be the same before the update
          expect(page2.grantedUsers).toStrictEqual([pModelUser1._id]); // should be the same before the update
          expect(page2.grantedGroup).toBeUndefined(); // no group should be set
        });
        test('Fail to change to GRANT_USER_GROUP if the group to set is an ancestor of the parent page group', async() => {
          // path
          const _path1 = '/mup33_C';
          const _path2 = '/mup33_C/mup34_owner';
          // page
          const _page1 = await Page.findOne({ path: _path1, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdC }); // groupC
          const _page2 = await Page.findOne({ // update target
            path: _path2, grant: Page.GRANT_OWNER, grantedUsers: [pModelUser3], parent: _page1._id,
          });
          expect(_page1).toBeTruthy();
          expect(_page2).toBeTruthy();

          const options = { grant: Page.GRANT_USER_GROUP, grantUserGroupId: groupIdA };

          // Group relation(parent -> child): groupIdA -> groupIdB -> groupIdC
          // this should fail because the groupC is a descendant of groupA
          await expect(updatePage(_page2, 'new', 'old', pModelUser3, options)) // from GRANT_OWNER to GRANT_USER_GROUP(groupIdA)
            .rejects.toThrow(new Error('The selected grant or grantedGroup is not assignable to this page.'));

          const page1 = await Page.findById(_page1._id);
          const page2 = await Page.findById(_page2._id);
          expect(page1).toBeTruthy();
          expect(page2).toBeTruthy();

          expect(page2.grant).toBe(Page.GRANT_OWNER); // should be the same before the update
          expect(page2.grantedUsers).toStrictEqual([pModelUser3._id]); // should be the same before the update
          expect(page2.grantedGroup).toBeUndefined(); // no group should be set
        });
      });
      describe('update grant of a page under a page with GRANT_OWNER', () => {
        test('Fail to change from GRNAT_OWNER', async() => {
          // path
          const path1 = '/mup35_owner';
          const path2 = '/mup35_owner/mup36_owner';
          // page
          const _page1 = await Page.findOne({ path: path1, grant: Page.GRANT_OWNER, grantedUsers: [pModelUser1] });
          const _page2 = await Page.findOne({ // update target
            path: path2, grant: Page.GRANT_OWNER, grantedUsers: [pModelUser1], parent: _page1._id,
          });
          expect(_page1).toBeTruthy();
          expect(_page2).toBeTruthy();

          const options = { grant: Page.GRANT_USER_GROUP, grantUserGroupId: groupIdA };
          await expect(updatePage(_page2, 'new', 'old', pModelUser1, options)) // from GRANT_OWNER to GRANT_USER_GROUP(groupIdA)
            .rejects.toThrow(new Error('The selected grant or grantedGroup is not assignable to this page.'));

          const page1 = await Page.findById(_page1.id);
          const page2 = await Page.findById(_page2.id);
          expect(page1).toBeTruthy();
          expect(page2).toBeTruthy();
          expect(page2.grant).toBe(Page.GRANT_OWNER); // should be the same before the update
          expect(page2.grantedUsers).toStrictEqual([pModelUser1._id]); // should be the same before the update
          expect(page2.grantedGroup).toBeUndefined(); // no group should be set
        });
      });

    });

  });
});
