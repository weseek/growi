/* eslint-disable no-unused-vars */
import { advanceTo } from 'jest-date-mock';

import mongoose from 'mongoose';

import { getInstance } from '../setup-crowi';

let testUser1;
let testUser2;
let parentTag;
let childTag;

let parentForRename1;
let parentForRename2;
let parentForRename3;
let parentForRename4;
let parentForRename5;
let parentForRename6;
let parentForRename7;
let parentForRename8;
let parentForRename9;

let irrelevantPage1;
let irrelevantPage2;

let childForRename1;
let childForRename2;
let childForRename3;

let parentForDuplicate;

let parentForDelete1;
let parentForDelete2;

let childForDelete;

let parentForDeleteCompletely;

let parentForRevert1;
let parentForRevert2;

let childForDuplicate;
let childForDeleteCompletely;

let childForRevert;

describe('PageService', () => {

  let crowi;
  let Page;
  let Revision;
  let User;
  let Tag;
  let PageTagRelation;
  let Bookmark;
  let Comment;
  let ShareLink;
  let xssSpy;

  beforeAll(async() => {
    crowi = await getInstance();

    User = mongoose.model('User');
    Page = mongoose.model('Page');
    Revision = mongoose.model('Revision');
    Tag = mongoose.model('Tag');
    PageTagRelation = mongoose.model('PageTagRelation');
    Bookmark = mongoose.model('Bookmark');
    Comment = mongoose.model('Comment');
    ShareLink = mongoose.model('ShareLink');

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
        path: '/parentForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRename6',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/level1/level2',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/level1/level2/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/level1/level2/level2',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRename6-2021H1',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/level1-2021H1',
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
        path: '/parentForRename2/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForRename3/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForDuplicate',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
        revision: '600d395667536503354cbe91',
      },
      {
        path: '/parentForDuplicate/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
        revision: '600d395667536503354cbe92',
      },
      {
        path: '/parentForDelete1',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/parentForDelete2',
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
        path: '/trash/parentForRevert1',
        status: Page.STATUS_DELETED,
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/trash/parentForRevert2',
        status: Page.STATUS_DELETED,
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
      {
        path: '/trash/parentForRevert/child',
        status: Page.STATUS_DELETED,
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
      },
    ]);

    parentForRename1 = await Page.findOne({ path: '/parentForRename1' });
    parentForRename2 = await Page.findOne({ path: '/parentForRename2' });
    parentForRename3 = await Page.findOne({ path: '/parentForRename3' });
    parentForRename4 = await Page.findOne({ path: '/parentForRename4' });
    parentForRename5 = await Page.findOne({ path: '/parentForRename5' });
    parentForRename6 = await Page.findOne({ path: '/parentForRename6' });
    parentForRename7 = await Page.findOne({ path: '/level1/level2' });
    parentForRename8 = await Page.findOne({ path: '/level1/level2/child' });
    parentForRename9 = await Page.findOne({ path: '/level1/level2/level2' });

    irrelevantPage1 = await Page.findOne({ path: '/parentForRename6-2021H1' });
    irrelevantPage2 = await Page.findOne({ path: '/level1-2021H1' });

    parentForDuplicate = await Page.findOne({ path: '/parentForDuplicate' });

    parentForDelete1 = await Page.findOne({ path: '/parentForDelete1' });
    parentForDelete2 = await Page.findOne({ path: '/parentForDelete2' });

    parentForDeleteCompletely = await Page.findOne({ path: '/parentForDeleteCompletely' });
    parentForRevert1 = await Page.findOne({ path: '/trash/parentForRevert1' });
    parentForRevert2 = await Page.findOne({ path: '/trash/parentForRevert2' });

    childForRename1 = await Page.findOne({ path: '/parentForRename1/child' });
    childForRename2 = await Page.findOne({ path: '/parentForRename2/child' });
    childForRename3 = await Page.findOne({ path: '/parentForRename3/child' });

    childForDuplicate = await Page.findOne({ path: '/parentForDuplicate/child' });
    childForDelete = await Page.findOne({ path: '/parentForDelete/child' });
    childForDeleteCompletely = await Page.findOne({ path: '/parentForDeleteCompletely/child' });
    childForRevert = await Page.findOne({ path: '/trash/parentForRevert/child' });


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

    await Revision.insertMany([
      {
        _id: '600d395667536503354cbe91',
        pageId: parentForDuplicate._id,
        body: 'duplicateBody',
      },
      {
        _id: '600d395667536503354cbe92',
        pageId: childForDuplicate._id,
        body: 'duplicateChildBody',
      },
    ]);

    xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);
  });

  describe('rename page without using renameDescendantsWithStreamSpy', () => {
    test('rename page with different tree with isRecursively [deeper]', async() => {
      const resultPage = await crowi.pageService.renamePage(parentForRename6, '/parentForRename6/renamedChild', testUser1, {});
      const wrongPage = await Page.findOne({ path: '/parentForRename6/renamedChild/renamedChild' });
      const expectPage1 = await Page.findOne({ path: '/parentForRename6/renamedChild' });
      const expectPage2 = await Page.findOne({ path: '/parentForRename6-2021H1' });

      expect(resultPage.path).toEqual(expectPage1.path);
      expect(expectPage2.path).not.toBeNull();

      // Check that pages that are not to be renamed have not been renamed
      expect(wrongPage).toBeNull();
    });

    test('rename page with different tree with isRecursively [shallower]', async() => {
      // setup
      expect(await Page.findOne({ path: '/level1' })).toBeNull();
      expect(await Page.findOne({ path: '/level1/level2' })).not.toBeNull();
      expect(await Page.findOne({ path: '/level1/level2/child' })).not.toBeNull();
      expect(await Page.findOne({ path: '/level1/level2/level2' })).not.toBeNull();
      expect(await Page.findOne({ path: '/level1-2021H1' })).not.toBeNull();

      // when
      //   rename /level1/level2 --> /level1
      await crowi.pageService.renamePage(parentForRename7, '/level1', testUser1, {});

      // then
      expect(await Page.findOne({ path: '/level1' })).not.toBeNull();
      expect(await Page.findOne({ path: '/level1/child' })).not.toBeNull();
      expect(await Page.findOne({ path: '/level1/level2' })).not.toBeNull();
      expect(await Page.findOne({ path: '/level1/level2/child' })).toBeNull();
      expect(await Page.findOne({ path: '/level1/level2/level2' })).toBeNull();

      // Check that pages that are not to be renamed have not been renamed
      expect(await Page.findOne({ path: '/level1-2021H1' })).not.toBeNull();
    });
  });

  describe('rename page', () => {
    let pageEventSpy;
    let renameDescendantsWithStreamSpy;
    // mock new Date() and Date.now()
    advanceTo(new Date(2000, 1, 1, 0, 0, 0));
    const dateToUse = new Date();

    beforeEach(async() => {
      pageEventSpy = jest.spyOn(crowi.pageService.pageEvent, 'emit').mockImplementation();
      renameDescendantsWithStreamSpy = jest.spyOn(crowi.pageService, 'renameDescendantsWithStream').mockImplementation();
    });

    describe('renamePage()', () => {

      test('rename page without options', async() => {

        const resultPage = await crowi.pageService.renamePage(parentForRename1, '/renamed1', testUser2, {});

        expect(xssSpy).toHaveBeenCalled();
        expect(renameDescendantsWithStreamSpy).toHaveBeenCalled(); // single rename is deprecated

        expect(pageEventSpy).toHaveBeenCalledWith('rename', parentForRename1, testUser2);

        expect(resultPage.path).toBe('/renamed1');
        expect(resultPage.updatedAt).toEqual(parentForRename1.updatedAt);
        expect(resultPage.lastUpdateUser).toEqual(testUser1._id);
      });

      test('rename page with updateMetadata option', async() => {

        const resultPage = await crowi.pageService.renamePage(parentForRename2, '/renamed2', testUser2, { updateMetadata: true });

        expect(xssSpy).toHaveBeenCalled();
        expect(renameDescendantsWithStreamSpy).toHaveBeenCalled();

        expect(pageEventSpy).toHaveBeenCalledWith('rename', parentForRename2, testUser2);

        expect(resultPage.path).toBe('/renamed2');
        expect(resultPage.updatedAt).toEqual(dateToUse);
        expect(resultPage.lastUpdateUser).toEqual(testUser2._id);
      });

      test('rename page with createRedirectPage option', async() => {

        const resultPage = await crowi.pageService.renamePage(parentForRename3, '/renamed3', testUser2, { createRedirectPage: true });

        expect(xssSpy).toHaveBeenCalled();
        expect(renameDescendantsWithStreamSpy).toHaveBeenCalled();
        expect(pageEventSpy).toHaveBeenCalledWith('rename', parentForRename3, testUser2);

        expect(resultPage.path).toBe('/renamed3');
        expect(resultPage.updatedAt).toEqual(parentForRename3.updatedAt);
        expect(resultPage.lastUpdateUser).toEqual(testUser1._id);
      });

      test('rename page with isRecursively', async() => {

        const resultPage = await crowi.pageService.renamePage(parentForRename4, '/renamed4', testUser2, { }, true);

        expect(xssSpy).toHaveBeenCalled();
        expect(renameDescendantsWithStreamSpy).toHaveBeenCalled();
        expect(pageEventSpy).toHaveBeenCalledWith('rename', parentForRename4, testUser2);

        expect(resultPage.path).toBe('/renamed4');
        expect(resultPage.updatedAt).toEqual(parentForRename4.updatedAt);
        expect(resultPage.lastUpdateUser).toEqual(testUser1._id);
      });

      test('rename page with different tree with isRecursively', async() => {

        const resultPage = await crowi.pageService.renamePage(parentForRename5, '/parentForRename5/renamedChild', testUser1, {}, true);
        const wrongPage = await Page.findOne({ path: '/parentForRename5/renamedChild/renamedChild' });
        const expectPage = await Page.findOne({ path: '/parentForRename5/renamedChild' });

        expect(resultPage.path).toEqual(expectPage.path);
        expect(wrongPage).toBeNull();
      });

    });

    test('renameDescendants without options', async() => {
      const oldPagePathPrefix = new RegExp('^/parentForRename1', 'i');
      const newPagePathPrefix = '/renamed1';

      await crowi.pageService.renameDescendants([childForRename1], testUser2, {}, oldPagePathPrefix, newPagePathPrefix);
      const resultPage = await Page.findOne({ path: '/renamed1/child' });

      expect(resultPage).not.toBeNull();
      expect(pageEventSpy).toHaveBeenCalledWith('updateMany', [childForRename1], testUser2);

      expect(resultPage.path).toBe('/renamed1/child');
      expect(resultPage.updatedAt).toEqual(childForRename1.updatedAt);
      expect(resultPage.lastUpdateUser).toEqual(testUser1._id);
    });

    test('renameDescendants with updateMetadata option', async() => {
      const oldPagePathPrefix = new RegExp('^/parentForRename2', 'i');
      const newPagePathPrefix = '/renamed2';

      await crowi.pageService.renameDescendants([childForRename2], testUser2, { updateMetadata: true }, oldPagePathPrefix, newPagePathPrefix);
      const resultPage = await Page.findOne({ path: '/renamed2/child' });

      expect(resultPage).not.toBeNull();
      expect(pageEventSpy).toHaveBeenCalledWith('updateMany', [childForRename2], testUser2);

      expect(resultPage.path).toBe('/renamed2/child');
      expect(resultPage.updatedAt).toEqual(dateToUse);
      expect(resultPage.lastUpdateUser).toEqual(testUser2._id);
    });

    test('renameDescendants with createRedirectPage option', async() => {
      const oldPagePathPrefix = new RegExp('^/parentForRename3', 'i');
      const newPagePathPrefix = '/renamed3';

      await crowi.pageService.renameDescendants([childForRename3], testUser2, { createRedirectPage: true }, oldPagePathPrefix, newPagePathPrefix);
      const resultPage = await Page.findOne({ path: '/renamed3/child' });

      expect(resultPage).not.toBeNull();
      expect(pageEventSpy).toHaveBeenCalledWith('updateMany', [childForRename3], testUser2);

      expect(resultPage.path).toBe('/renamed3/child');
      expect(resultPage.updatedAt).toEqual(childForRename3.updatedAt);
      expect(resultPage.lastUpdateUser).toEqual(testUser1._id);
    });
  });
});
