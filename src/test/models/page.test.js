const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

let testUser0;
let testUser1;
let testUser2;
let testGroup0;

describe('Page', () => {
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

    await User.insertMany([
      { name: 'Anon 0', username: 'anonymous0', email: 'anonymous0@example.com' },
      { name: 'Anon 1', username: 'anonymous1', email: 'anonymous1@example.com' },
      { name: 'Anon 2', username: 'anonymous2', email: 'anonymous2@example.com' },
    ]);

    await UserGroup.insertMany([
      { name: 'TestGroup0' },
      { name: 'TestGroup1' },
    ]);

    testUser0 = await User.findOne({ username: 'anonymous0' });
    testUser1 = await User.findOne({ username: 'anonymous1' });
    testUser2 = await User.findOne({ username: 'anonymous2' });

    testGroup0 = await UserGroup.findOne({ name: 'TestGroup0' });

    await UserGroupRelation.insertMany([
      {
        relatedGroup: testGroup0,
        relatedUser: testUser0,
      },
      {
        relatedGroup: testGroup0,
        relatedUser: testUser1,
      },
    ]);

    await Page.insertMany([
      {
        path: '/user/anonymous0/memo',
        grant: Page.GRANT_RESTRICTED,
        grantedUsers: [testUser0],
        creator: testUser0,
      },
      {
        path: '/grant/public',
        grant: Page.GRANT_PUBLIC,
        grantedUsers: [testUser0],
        creator: testUser0,
      },
      {
        path: '/grant/restricted',
        grant: Page.GRANT_RESTRICTED,
        grantedUsers: [testUser0],
        creator: testUser0,
      },
      {
        path: '/grant/specified',
        grant: Page.GRANT_SPECIFIED,
        grantedUsers: [testUser0],
        creator: testUser0,
      },
      {
        path: '/grant/owner',
        grant: Page.GRANT_OWNER,
        grantedUsers: [testUser0],
        creator: testUser0,
      },
      {
        path: '/page/for/extended',
        grant: Page.GRANT_PUBLIC,
        creator: testUser0,
        extended: { hoge: 1 },
      },
      {
        path: '/grant/groupacl',
        grant: Page.GRANT_USER_GROUP,
        grantedUsers: [],
        grantedGroup: testGroup0,
        creator: testUser1,
      },
      {
        path: '/page1',
        grant: Page.GRANT_PUBLIC,
        creator: testUser0,
      },
      {
        path: '/page1/child1',
        grant: Page.GRANT_PUBLIC,
        creator: testUser0,
      },
      {
        path: '/page2',
        grant: Page.GRANT_PUBLIC,
        creator: testUser0,
      },
    ]);

    done();
  });

  describe('.isPublic', () => {
    describe('with a public page', () => {
      test('should return true', (done) => {
        Page.findOne({ path: '/grant/public' }, (err, page) => {
          expect(err).toBeNull();
          expect(page.isPublic()).toEqual(true);
          done();
        });
      });
    });

    ['restricted', 'specified', 'owner'].forEach((grant) => {
      describe(`with a ${grant} page`, () => {
        test('should return false', (done) => {
          Page.findOne({ path: `/grant/${grant}` }, (err, page) => {
            expect(err).toBeNull();
            expect(page.isPublic()).toEqual(false);
            done();
          });
        });
      });
    });
  });

  describe('.getDeletedPageName', () => {
    test('should return trash page name', () => {
      expect(Page.getDeletedPageName('/hoge')).toEqual('/trash/hoge');
      expect(Page.getDeletedPageName('hoge')).toEqual('/trash/hoge');
    });
  });
  describe('.getRevertDeletedPageName', () => {
    test('should return reverted trash page name', () => {
      expect(Page.getRevertDeletedPageName('/hoge')).toEqual('/hoge');
      expect(Page.getRevertDeletedPageName('/trash/hoge')).toEqual('/hoge');
      expect(Page.getRevertDeletedPageName('/trash/hoge/trash')).toEqual('/hoge/trash');
    });
  });

  describe('.isDeletableName', () => {
    test('should decide deletable or not', () => {
      expect(Page.isDeletableName('/hoge')).toBeTruthy();
      expect(Page.isDeletableName('/user/xxx')).toBeFalsy();
      expect(Page.isDeletableName('/user/xxx123')).toBeFalsy();
      expect(Page.isDeletableName('/user/xxx/')).toBeTruthy();
      expect(Page.isDeletableName('/user/xxx/hoge')).toBeTruthy();
    });
  });

  describe('.isCreatableName', () => {
    test('should decide creatable or not', () => {
      expect(Page.isCreatableName('/hoge')).toBeTruthy();

      // edge cases
      expect(Page.isCreatableName('/me')).toBeFalsy();
      expect(Page.isCreatableName('/me/')).toBeFalsy();
      expect(Page.isCreatableName('/me/x')).toBeFalsy();
      expect(Page.isCreatableName('/meeting')).toBeTruthy();
      expect(Page.isCreatableName('/meeting/x')).toBeTruthy();

      // end with "edit"
      expect(Page.isCreatableName('/meeting/edit')).toBeFalsy();

      // under score
      expect(Page.isCreatableName('/_')).toBeTruthy();
      expect(Page.isCreatableName('/_template')).toBeTruthy();
      expect(Page.isCreatableName('/__template')).toBeTruthy();
      expect(Page.isCreatableName('/_r/x')).toBeFalsy();
      expect(Page.isCreatableName('/_api')).toBeFalsy();
      expect(Page.isCreatableName('/_apix')).toBeFalsy();
      expect(Page.isCreatableName('/_api/x')).toBeFalsy();

      expect(Page.isCreatableName('/hoge/xx.md')).toBeFalsy();

      // start with https?
      expect(Page.isCreatableName('/http://demo.growi.org/hoge')).toBeFalsy();
      expect(Page.isCreatableName('/https://demo.growi.org/hoge')).toBeFalsy();
      expect(Page.isCreatableName('http://demo.growi.org/hoge')).toBeFalsy();
      expect(Page.isCreatableName('https://demo.growi.org/hoge')).toBeFalsy();

      expect(Page.isCreatableName('/ the / path / with / space')).toBeFalsy();

      const forbidden = ['installer', 'register', 'login', 'logout',
                         'admin', 'files', 'trash', 'paste', 'comments'];
      for (let i = 0; i < forbidden.length; i++) {
        const pn = forbidden[i];
        expect(Page.isCreatableName(`/${pn}`)).toBeFalsy();
        expect(Page.isCreatableName(`/${pn}/`)).toBeFalsy();
        expect(Page.isCreatableName(`/${pn}/abc`)).toBeFalsy();
      }
    });
  });

  describe('.isAccessiblePageByViewer', () => {
    describe('with a granted user', () => {
      test('should return true', async() => {
        const user = await User.findOne({ email: 'anonymous0@example.com' });
        const page = await Page.findOne({ path: '/user/anonymous0/memo' });

        const bool = await Page.isAccessiblePageByViewer(page.id, user);
        expect(bool).toEqual(true);
      });
    });

    describe('with a public page', () => {
      test('should return true', async() => {
        const user = await User.findOne({ email: 'anonymous1@example.com' });
        const page = await Page.findOne({ path: '/grant/public' });

        const bool = await Page.isAccessiblePageByViewer(page.id, user);
        expect(bool).toEqual(true);
      });
    });

    describe('with a restricted page and an user who has no grant', () => {
      test('should return false', async() => {
        const user = await User.findOne({ email: 'anonymous1@example.com' });
        const page = await Page.findOne({ path: '/grant/owner' });

        const bool = await Page.isAccessiblePageByViewer(page.id, user);
        expect(bool).toEqual(false);
      });
    });
  });

  describe('Extended field', () => {
    describe('Slack Channel.', () => {
      test('should be empty', (done) => {
        Page.findOne({ path: '/page/for/extended' }, (err, page) => {
          expect(page.extended.hoge).toEqual(1);
          expect(page.getSlackChannel()).toEqual('');
          done();
        });
      });

      test('set slack channel and should get it and should keep hoge ', async() => {
        let page = await Page.findOne({ path: '/page/for/extended' });
        await page.updateSlackChannel('slack-channel1');
        page = await Page.findOne({ path: '/page/for/extended' });
        expect(page.extended.hoge).toEqual(1);
        expect(page.getSlackChannel()).toEqual('slack-channel1');
      });
    });
  });

  describe('.findPage', () => {
    describe('findByIdAndViewer', () => {
      test('should find page (public)', async() => {
        const expectedPage = await Page.findOne({ path: '/grant/public' });
        const page = await Page.findByIdAndViewer(expectedPage.id, testUser0);
        expect(page).not.toBeNull();
        expect(page.path).toEqual(expectedPage.path);
      });

      test('should find page (anyone knows link)', async() => {
        const expectedPage = await Page.findOne({ path: '/grant/restricted' });
        const page = await Page.findByIdAndViewer(expectedPage.id, testUser1);
        expect(page).not.toBeNull();
        expect(page.path).toEqual(expectedPage.path);
      });

      test('should find page (just me)', async() => {
        const expectedPage = await Page.findOne({ path: '/grant/owner' });
        const page = await Page.findByIdAndViewer(expectedPage.id, testUser0);
        expect(page).not.toBeNull();
        expect(page.path).toEqual(expectedPage.path);
      });

      test('should not be found by grant (just me)', async() => {
        const expectedPage = await Page.findOne({ path: '/grant/owner' });
        const page = await Page.findByIdAndViewer(expectedPage.id, testUser1);
        expect(page).toBeNull();
      });
    });

    describe('findByIdAndViewer granted userGroup', () => {
      test('should find page', async() => {
        const expectedPage = await Page.findOne({ path: '/grant/groupacl' });
        const page = await Page.findByIdAndViewer(expectedPage.id, testUser0);
        expect(page).not.toBeNull();
        expect(page.path).toEqual(expectedPage.path);
      });

      test('should not be found by grant', async() => {
        const expectedPage = await Page.findOne({ path: '/grant/groupacl' });
        const page = await Page.findByIdAndViewer(expectedPage.id, testUser2);
        expect(page).toBeNull();
      });
    });
  });

  describe('findListWithDescendants', () => {
    test('should return only /page/', async() => {
      const result = await Page.findListWithDescendants('/page/', testUser0, { isRegExpEscapedFromPath: true });

      // assert totalCount
      expect(result.totalCount).toEqual(1);
      // assert paths
      const pagePaths = result.pages.map((page) => { return page.path });
      expect(pagePaths).toContainEqual('/page/for/extended');
    });

    test('should return only /page1/', async() => {
      const result = await Page.findListWithDescendants('/page1/', testUser0, { isRegExpEscapedFromPath: true });

      // assert totalCount
      expect(result.totalCount).toEqual(2);
      // assert paths
      const pagePaths = result.pages.map((page) => { return page.path });
      expect(pagePaths).toContainEqual('/page1');
      expect(pagePaths).toContainEqual('/page1/child1');
    });
  });

  describe('findListByStartWith', () => {
    test('should return pages which starts with /page', async() => {
      const result = await Page.findListByStartWith('/page', testUser0, {});

      // assert totalCount
      expect(result.totalCount).toEqual(4);
      // assert paths
      const pagePaths = result.pages.map((page) => { return page.path });
      expect(pagePaths).toContainEqual('/page/for/extended');
      expect(pagePaths).toContainEqual('/page1');
      expect(pagePaths).toContainEqual('/page1/child1');
      expect(pagePaths).toContainEqual('/page2');
    });

    test('should process with regexp', async() => {
      const result = await Page.findListByStartWith('/page\\d{1}/', testUser0, {});

      // assert totalCount
      expect(result.totalCount).toEqual(3);
      // assert paths
      const pagePaths = result.pages.map((page) => { return page.path });
      expect(pagePaths).toContainEqual('/page1');
      expect(pagePaths).toContainEqual('/page1/child1');
      expect(pagePaths).toContainEqual('/page2');
    });
  });
});
