const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

describe('V5 page migration', () => {
  let crowi;
  let Page;
  let User;

  let testUser1;

  beforeAll(async() => {
    jest.restoreAllMocks();

    crowi = await getInstance();
    Page = mongoose.model('Page');
    User = mongoose.model('User');

    await User.insertMany([{ name: 'testUser1', username: 'testUser1', email: 'testUser1@example.com' }]);
    testUser1 = await User.findOne({ username: 'testUser1' });
  });


  describe('normalizeParentRecursivelyByPages()', () => {
    test('should migrate all pages specified by pageIds', async() => {
      jest.restoreAllMocks();

      // initialize pages for test
      const pages = await Page.insertMany([
        {
          path: '/',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
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
      ]);

      // migrate
      await crowi.pageService.normalizeParentRecursivelyByPages(pages, testUser1);

      const migratedPages = await Page.find({
        path: {
          $in: ['/private1', '/dummyParent', '/dummyParent/private1', '/dummyParent/private1/private2', '/dummyParent/private1/private3'],
        },
      });
      const migratedPagePaths = migratedPages.filter(doc => doc.parent != null).map(doc => doc.path);

      const expected = ['/private1', '/dummyParent', '/dummyParent/private1', '/dummyParent/private1/private2', '/dummyParent/private1/private3'];

      expect(migratedPagePaths.sort()).toStrictEqual(expected.sort());
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
