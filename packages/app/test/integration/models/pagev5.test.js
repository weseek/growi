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
    if (dummyUser1 == null) {
      dummyUser1 = await User.create({ name: 'v5DummyUser1', username: 'v5DummyUser1', email: 'v5DummyUser1@example.com' });
    }

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

    const createPageId1 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        _id: createPageId1,
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
        parent: createPageId1,
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
      expect(grandchildPage).toBeTruthy();
      expect(childPage.parent).toStrictEqual(rootPage._id);
      expect(grandchildPage.parent).toStrictEqual(childPage._id);
    });

  });
});
