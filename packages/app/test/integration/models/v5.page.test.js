import mongoose from 'mongoose';

import { getInstance } from '../setup-crowi';

describe('Page', () => {
  let crowi;
  let Page;
  let Revision;
  let User;
  let Tag;
  let PageTagRelation;
  let Bookmark;
  let Comment;
  let ShareLink;
  let PageRedirect;
  let xssSpy;

  let rootPage;
  let dummyUser1;

  // pass unless the data is one of [false, 0, '', null, undefined, NaN]
  const expectAllToBeTruthy = (dataList) => {
    dataList.forEach((data, i) => {
      if (data == null) { console.log(`index: ${i}`) }
      expect(data).toBeTruthy();
    });
  };

  beforeAll(async() => {
    crowi = await getInstance();
    await crowi.configManager.updateConfigsInTheSameNamespace('crowi', { 'app:isV5Compatible': true });

    jest.restoreAllMocks();
    User = mongoose.model('User');
    Page = mongoose.model('Page');
    Revision = mongoose.model('Revision');
    Tag = mongoose.model('Tag');
    PageTagRelation = mongoose.model('PageTagRelation');
    Bookmark = mongoose.model('Bookmark');
    Comment = mongoose.model('Comment');
    ShareLink = mongoose.model('ShareLink');
    PageRedirect = mongoose.model('PageRedirect');

    dummyUser1 = await User.findOne({ username: 'v5DummyUser1' });

    rootPage = await Page.findOne({ path: '/' });

    const pageIdCreate1 = new mongoose.Types.ObjectId();
    const pageIdCreate2 = new mongoose.Types.ObjectId();
    const pageIdCreate3 = new mongoose.Types.ObjectId();
    const pageIdCreate4 = new mongoose.Types.ObjectId();

    /**
     * create
     * mc_ => model create
     * emp => empty => page with isEmpty: true
     * pub => public => GRANT_PUBLIC
     */
    await Page.insertMany([
      {
        _id: pageIdCreate1,
        path: '/v5_empty_create_4',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        path: '/v5_empty_create_4/v5_create_5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdCreate1,
        isEmpty: false,
      },
      {
        _id: pageIdCreate2,
        path: '/mc4_top/mc1_emp',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        path: '/mc4_top/mc1_emp/mc2_pub',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdCreate2,
        isEmpty: false,
      },
      {
        path: '/mc5_top/mc3_awl',
        grant: Page.GRANT_RESTRICTED,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
      },
      {
        _id: pageIdCreate3,
        path: '/mc4_top',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 1,
      },
      {
        _id: pageIdCreate4,
        path: '/mc5_top',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        isEmpty: false,
        parent: rootPage._id,
        descendantCount: 0,
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
    ]);

  });
  describe('create', () => {

    test('Should create single page', async() => {
      const page = await Page.create('/v5_create1', 'create1', dummyUser1, {});
      expect(page).toBeTruthy();
      expect(page.parent).toStrictEqual(rootPage._id);
    });

    test('Should create empty-child and non-empty grandchild', async() => {
      const grandchildPage = await Page.create('/v5_empty_create2/v5_create_3', 'grandchild', dummyUser1, {});
      const childPage = await Page.findOne({ path: '/v5_empty_create2' });

      expect(childPage.isEmpty).toBe(true);
      expect(grandchildPage).toBeTruthy();
      expect(childPage).toBeTruthy();
      expect(childPage.parent).toStrictEqual(rootPage._id);
      expect(grandchildPage.parent).toStrictEqual(childPage._id);
    });

    test('Should create on empty page', async() => {
      const beforeCreatePage = await Page.findOne({ path: '/v5_empty_create_4' });
      expect(beforeCreatePage.isEmpty).toBe(true);

      const childPage = await Page.create('/v5_empty_create_4', 'body', dummyUser1, {});
      const grandchildPage = await Page.findOne({ parent: childPage._id });

      expect(childPage).toBeTruthy();
      expect(childPage.isEmpty).toBe(false);
      expect(childPage.revision.body).toBe('body');
      expect(grandchildPage).toBeTruthy();
      expect(childPage.parent).toStrictEqual(rootPage._id);
      expect(grandchildPage.parent).toStrictEqual(childPage._id);
    });

    describe('Creating a page using existing path', () => {
      test('with grant RESTRICTED should only create the page and change nothing else', async() => {
        const pathT = '/mc4_top';
        const path1 = '/mc4_top/mc1_emp';
        const path2 = '/mc4_top/mc1_emp/mc2_pub';
        const pageT = await Page.findOne({ path: pathT, descendantCount: 1 });
        const page1 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC });
        const page2 = await Page.findOne({ path: path2 });
        const page3 = await Page.findOne({ path: path1, grant: Page.GRANT_RESTRICTED });
        expect(pageT).toBeTruthy();
        expect(page1).toBeTruthy();
        expect(page2).toBeTruthy();
        expect(page3).toBeNull();

        // use existing path
        await Page.create(path1, 'new body', dummyUser1, { grant: Page.GRANT_RESTRICTED });

        const _pageT = await Page.findOne({ path: pathT });
        const _page1 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC });
        const _page2 = await Page.findOne({ path: path2 });
        const _page3 = await Page.findOne({ path: path1, grant: Page.GRANT_RESTRICTED });
        expect(_pageT).toBeTruthy();
        expect(_page1).toBeTruthy();
        expect(_page2).toBeTruthy();
        expect(_page3).toBeTruthy();
        expect(_pageT.descendantCount).toBe(1);
      });
    });
    describe('Creating a page under a page with grant RESTRICTED', () => {
      test('will create a new empty page with the same path as the grant RESTRECTED page and become a parent', async() => {
        const pathT = '/mc5_top';
        const path1 = '/mc5_top/mc3_awl';
        const pathN = '/mc5_top/mc3_awl/mc4_pub'; // used to create
        const pageT = await Page.findOne({ path: pathT });
        const page1 = await Page.findOne({ path: path1, grant: Page.GRANT_RESTRICTED });
        const page2 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC });
        expect(pageT).toBeTruthy();
        expect(page1).toBeTruthy();
        expect(page2).toBeNull();

        await Page.create(pathN, 'new body', dummyUser1, { grant: Page.GRANT_PUBLIC });

        const _pageT = await Page.findOne({ path: pathT });
        const _page1 = await Page.findOne({ path: path1, grant: Page.GRANT_RESTRICTED });
        const _page2 = await Page.findOne({ path: path1, grant: Page.GRANT_PUBLIC, isEmpty: true });
        expect(_pageT).toBeTruthy();
        expect(_page1).toBeTruthy();
        expect(_page2).toBeTruthy();

        const createdPage = await Page.findOne({ path: pathN, grant: Page.GRANT_PUBLIC });
        expect(createdPage).toBeTruthy();
        expect(createdPage.parent).toStrictEqual(_page2._id);

        expect(_pageT.descendantCount).toStrictEqual(1);
      });
    });

  });

  describe('update', () => {

    describe('Changing grant from PUBLIC to RESTRICTED of', () => {
      test('an only-child page will delete its empty parent page', async() => {
        const pathT = '/mup13_top';
        const path1 = '/mup13_top/mup1_emp';
        const path2 = '/mup13_top/mup1_emp/mup2_pub';
        const pageT = await Page.findOne({ path: pathT, descendantCount: 2 });
        const page1 = await Page.findOne({ path: path1 });
        const page2 = await Page.findOne({ path: path2, grant: Page.GRANT_PUBLIC });

        const options = { grant: Page.GRANT_RESTRICTED, grantUserGroupId: null };
        expectAllToBeTruthy([pageT, page1, page2]);

        await Page.updatePage(page2, 'newRevisionBody', 'oldRevisionBody', dummyUser1, options);

        const _pageT = await Page.findOne({ path: pathT });
        const _page1 = await Page.findOne({ path: path1 });
        const _page2 = await Page.findOne({ path: path2 });
        expect(_page2).toBeTruthy();
        expect(_page1).toBeNull();

        expect(_page2.grant).toBe(Page.GRANT_RESTRICTED);
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
        const path1 = '/mup15_top';
        const path2 = '/mup15_top/mup8_pub';
        const top = await Page.findOne({ path: path1, descendantCount: 1 });
        const page = await Page.findOne({ path: path2, grant: Page.GRANT_PUBLIC });
        const count = await Page.count({ path: path2 });
        expect(top).toBeTruthy();
        expect(page).toBeTruthy();
        expect(count).toBe(1);

        await Page.updatePage(page, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: 2 });
        // AU => After Update
        const _top = await Page.findOne({ path: path1 });
        const _page = await Page.findOne({ path: path2 });
        const notExistantPage = await Page.findOne({ path: path2, isEmpty: true });
        const _count = await Page.count({ path: path2 });
        expect(_page).toBeTruthy();
        expect(_count).toBe(1);

        expect(notExistantPage).toBeNull();
        expect(_page.grant).toBe(Page.GRANT_RESTRICTED);

        expect(_top.descendantCount).toBe(0);
      });
    });
    describe('Changing grant from RESTRICTED to PUBLIC of', () => {
      test('a page will create ancestors if they do not exist', async() => {
        const top = await Page.findOne({ path: '/mup16_top' });
        const page = await Page.findOne({ path: '/mup16_top/mup9_pub/mup10_pub/mup11_awl', grant: Page.GRANT_RESTRICTED });
        const page1 = await Page.findOne({ path: '/mup16_top/mup9_pub' });
        const page2 = await Page.findOne({ path: '/mup16_top/mup9_pub/mup10_pub' });
        expect(top).toBeTruthy();
        expect(page).toBeTruthy();
        expect(page1).toBeNull();
        expect(page2).toBeNull();

        await Page.updatePage(page, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: 1 });

        const topAF = await Page.findOne({ _id: top._id });
        const pageAF = await Page.findOne({ _id: page._id });
        const page1AF = await Page.findOne({ path: '/mup16_top/mup9_pub' });
        const page2AF = await Page.findOne({ path: '/mup16_top/mup9_pub/mup10_pub' });
        expect(pageAF).toBeTruthy();
        expect(page1AF).toBeTruthy();
        expect(page2AF).toBeTruthy();

        expect(pageAF.grant).toBe(Page.GRANT_PUBLIC);
        expect(pageAF.parent).toStrictEqual(page2AF._id);

        expect(page1AF.isEmpty).toBe(true);
        expect(page1AF.parent).toStrictEqual(top._id);

        expect(page2AF.isEmpty).toBe(true);
        expect(page2AF.parent).toStrictEqual(page1AF._id);

        expect(topAF.descendantCount).toBe(1);
      });
      test('a page will replace an empty page with the same path if any', async() => {
        const top = await Page.findOne({ path: '/mup17_top', descendantCount: 1 });
        const page1 = await Page.findOne({ path: '/mup17_top/mup12_emp', isEmpty: true });
        const page2 = await Page.findOne({ path: '/mup17_top/mup12_emp', grant: Page.GRANT_RESTRICTED, isEmpty: false });
        const page3 = await Page.findOne({ path: '/mup17_top/mup12_emp/mup18_pub' });
        expect(top).toBeTruthy();
        expect(page1).toBeTruthy();
        expect(page2).toBeTruthy();
        expect(page3).toBeTruthy();

        await Page.updatePage(page2, 'newRevisionBody', 'oldRevisionBody', dummyUser1, { grant: Page.GRANT_PUBLIC });

        const topAF = await Page.findOne({ _id: top._id });
        const page1AF = await Page.findOne({ _id: page1._id });
        const page2AF = await Page.findOne({ _id: page2._id });
        const page3AF = await Page.findOne({ _id: page3._id });
        expect(page1AF).toBeNull();
        expect(page2AF).toBeTruthy();
        expect(page3AF).toBeTruthy();

        expect(page2AF.grant).toBe(Page.GRANT_PUBLIC);
        expect(page2AF.parent).toStrictEqual(topAF._id);
        expect(page3AF.parent).toStrictEqual(page2AF._id);

        expect(topAF.descendantCount).toBe(2);
      });
    });

  });
});
