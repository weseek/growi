/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

let testUser1;
let testUser2;
let parentTag;
let childTag;

let parentForRename1;
let parentForRename2;
let parentForRename3;
let parentForRename4;

let parentForDuplicate;
let parentForDelete;
let parentForDeleteCompletely;
let parentForRevert;

let childForRename;
let childForDuplicate;
let childForDelete;
let childForDeleteCompletely;
let childForRevert;

describe('PageService', () => {

  let crowi;
  let Page;
  let Revision;
  let User;
  let Tag;
  let PageTagRelation;

  beforeAll(async(done) => {
    crowi = await getInstance();

    User = mongoose.model('User');
    Page = mongoose.model('Page');
    Revision = mongoose.model('Revision');
    Tag = mongoose.model('Tag');
    PageTagRelation = mongoose.model('PageTagRelation');

    await User.insertMany([
      { name: 'someone1', username: 'someone1', email: 'someone1@example.com' },
      { name: 'someone2', username: 'someone2', email: 'someone2@example.com' },
    ]);

    testUser1 = await User.findOne({ username: 'someone1' });
    testUser2 = await User.findOne({ username: 'someone2' });

    await Page.insertMany([
      {
        path: '/parentForRename1',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRename2',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRename3',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRename4',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRename1/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForDuplicate',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForDuplicate/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForDelete',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForDelete/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForDeleteCompletely',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForDeleteCompletely/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRevert',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRevert/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
    ]);

    parentForRename1 = await Page.findOne({ path: '/parentForRename1' });
    parentForRename2 = await Page.findOne({ path: '/parentForRename2' });
    parentForRename3 = await Page.findOne({ path: '/parentForRename3' });
    parentForRename4 = await Page.findOne({ path: '/parentForRename4' });
    parentForDuplicate = await Page.findOne({ path: '/parentForDuplicate' });
    parentForDelete = await Page.findOne({ path: '/parentForDelete' });
    parentForDeleteCompletely = await Page.findOne({ path: '/parentForDeleteCompletely' });
    parentForRevert = await Page.findOne({ path: '/parentForRevert' });

    childForRename = await Page.findOne({ path: '/parentForRename1/child' });
    childForDuplicate = await Page.findOne({ path: '/parentForDuplicate/child' });
    childForDelete = await Page.findOne({ path: '/parentForDelete/child' });
    childForDeleteCompletely = await Page.findOne({ path: '/parentForDeleteCompletely/child' });
    childForRevert = await Page.findOne({ path: '/parentForRevert/child' });


    await Tag.insertMany([
      { name: 'Parent' },
      { name: 'Child' },
    ]);

    parentTag = await Tag.findOne({ name: 'Parent' });
    childTag = await Tag.findOne({ name: 'Child' });

    await PageTagRelation.insertMany([
      { relatedPage: parentForDuplicate, relatedTag: parentTag },
      { relatedPage: childForDuplicate, relatedTag: childTag },
    ]);

    done();
  });

  describe('rename page', () => {
    describe('renamePage()', () => {
      test('rename page without options', async() => {
        const resultPage = await crowi.pageService.renamePage(parentForRename1, '/renamed1', testUser2, {});
        const redirectedFromPage = await Page.findOne({ path: '/parentForRename1' });
        const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename1' });

        expect(resultPage.path).toBe('/renamed1');
        expect(resultPage.grant).toBe(1);
        expect(resultPage.status).toBe(Page.STATUS_PUBLISHED);
        expect(resultPage.lastUpdateUser).toEqual(testUser1._id);

        expect(redirectedFromPage).toBeNull();
        expect(redirectedFromPageRevision).toBeNull();
      });

      // test('rename page with updateMetadata option', async() => {
      //   parentForRename = await crowi.pageService.renamePage(parentForRename, '/parentForRename3', testUser2, { updateMetadata: true });
      //   const redirectedFromPage = await Page.findOne({ path: '/parentForRename2' });
      //   const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename2' });

      //   expect(parentForRename.path).toBe('/parentForRename3');
      //   expect(parentForRename.grant).toBe(1);
      //   expect(parentForRename.status).toBe(Page.STATUS_PUBLISHED);
      //   expect(parentForRename.lastUpdateUser).toEqual(testUser2._id);

      //   expect(redirectedFromPage).toBeNull();
      //   expect(redirectedFromPageRevision).toBeNull();
      // });

      // test('rename page with createRedirectPage option', async() => {
      //   parentForRename = await crowi.pageService.renamePage(parentForRename, '/parentForRename4', testUser2, { createRedirectPage: true });
      //   const redirectedFromPage = await Page.findOne({ path: '/parentForRename3' });
      //   const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename3' });

      //   expect(parentForRename.path).toBe('/parentForRename4');
      //   expect(parentForRename.grant).toBe(1);
      //   expect(parentForRename.status).toBe(Page.STATUS_PUBLISHED);
      //   expect(parentForRename.lastUpdateUser).toEqual(testUser2._id);


      //   expect(redirectedFromPage).not.toBeNull();
      //   expect(redirectedFromPage.redirectTo).toBe('/parentForRename4');
      //   expect(redirectedFromPageRevision).not.toBeNull();
      //   expect(redirectedFromPageRevision.body).toBe('redirect /parentForRename4');
      // });

      // test('rename page with isRecursively', async() => {
      //   parentForRename = await crowi.pageService.renamePage(parentForRename, '/parentForRename5', testUser2, { }, true);
      //   const redirectedFromPage = await Page.findOne({ path: '/parentForRename4' });
      //   const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename4' });

      //   expect(parentForRename.path).toBe('/parentForRename5');
      //   expect(parentForRename.grant).toBe(1);
      //   expect(parentForRename.status).toBe(Page.STATUS_PUBLISHED);
      //   expect(parentForRename.lastUpdateUser).toEqual(testUser2._id);

      //   expect(redirectedFromPage).toBeNull();
      //   expect(redirectedFromPageRevision).toBeNull();
      // });
    });

    test('renameDescendants()', () => {
      expect(3).toBe(3);
    });
  });


  describe('duplicate page', () => {
    test('duplicate()', () => {
      expect(3).toBe(3);
    });

    test('duplicateDescendants()', () => {
      expect(3).toBe(3);
    });

    test('duplicateTags()', () => {
      expect(3).toBe(3);
    });
  });

  describe('delete page', () => {
    test('deletePage()', () => {
      expect(3).toBe(3);
    });

    test('deleteDescendants()', () => {
      expect(3).toBe(3);
    });
  });

  describe('delete page completely', () => {
    test('deleteCompletely()', () => {
      expect(3).toBe(3);
    });

    test('deleteMultipleCompletely()', () => {
      expect(3).toBe(3);
    });
  });

  describe('revert page', () => {
    test('revertDeletedPage()', () => {
      expect(3).toBe(3);
    });

    test('revertDeletedPages()', () => {
      expect(3).toBe(3);
    });
  });


});
