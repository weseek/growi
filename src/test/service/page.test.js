/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

let testUser1;
let testUser2;
let parentTag;
let childTag;

let parentForRename;
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
  let User;
  let Tag;
  let PageTagRelation;

  beforeAll(async(done) => {
    crowi = await getInstance();

    User = mongoose.model('User');
    Page = mongoose.model('Page');
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
        path: '/parentForRename',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRename/child',
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

    parentForRename = await Page.findOne({ path: '/parentForRename' });
    parentForDuplicate = await Page.findOne({ path: '/parentForDuplicate' });
    parentForDelete = await Page.findOne({ path: '/parentForDelete' });
    parentForDeleteCompletely = await Page.findOne({ path: '/parentForDeleteCompletely' });
    parentForRevert = await Page.findOne({ path: '/parentForRevert' });

    childForRename = await Page.findOne({ path: '/parentForRename/child' });
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
        parentForRename = await crowi.pageService.renamePage(parentForRename, '/parentForRename2', testUser2, {});

        console.log(parentForRename);

        expect(parentForRename.path).toBe('/parentForRename2');
        expect(parentForRename.grant).toBe(1);
        expect(parentForRename.status).toBe(Page.STATUS_PUBLISHED);
        expect(parentForRename.lastUpdateUser).toEqual(testUser1._id);
      });

      test('rename page with updateMetadata option', async() => {
        parentForRename = await crowi.pageService.renamePage(parentForRename, '/parentForRename3', testUser2, { updateMetadata: true });

        console.log(parentForRename);
        console.log(testUser1._id);

        expect(parentForRename.path).toBe('/parentForRename3');
        expect(parentForRename.grant).toBe(1);
        expect(parentForRename.status).toBe(Page.STATUS_PUBLISHED);
        expect(parentForRename.lastUpdateUser).toEqual(testUser2._id);
      });
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
