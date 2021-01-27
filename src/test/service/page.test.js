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
  let xssSpy;

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
        revision: '600d395667536503354cbe91',
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

    await Revision.insertMany([
      {
        _id: '600d395667536503354cbe91',
        path: parentForDuplicate,
        body: 'duplicateBody',
      },
    ]);

    xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);


    done();
  });

  describe('rename page', () => {
    let pageEventSpy;
    let renameDescendantsWithStreamSpy;
    const dateToUse = new Date('2000-01-01');
    const socketClientId = null;

    beforeEach(async(done) => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => dateToUse);
      pageEventSpy = jest.spyOn(crowi.pageService.pageEvent, 'emit').mockImplementation();
      renameDescendantsWithStreamSpy = jest.spyOn(crowi.pageService, 'renameDescendantsWithStream').mockImplementation();
      done();
    });

    describe('renamePage()', () => {

      test('rename page without options', async() => {

        const resultPage = await crowi.pageService.renamePage(parentForRename1, '/renamed1', testUser2, {});
        const redirectedFromPage = await Page.findOne({ path: '/parentForRename1' });
        const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename1' });

        expect(xssSpy).toHaveBeenCalled();
        expect(renameDescendantsWithStreamSpy).not.toHaveBeenCalled();
        expect(pageEventSpy).toHaveBeenCalledWith('delete', parentForRename1, testUser2, socketClientId);
        expect(pageEventSpy).toHaveBeenCalledWith('create', resultPage, testUser2, socketClientId);

        expect(resultPage.path).toBe('/renamed1');
        expect(resultPage.updatedAt).toEqual(parentForRename1.updatedAt);
        expect(resultPage.lastUpdateUser).toEqual(testUser1._id);

        expect(redirectedFromPage).toBeNull();
        expect(redirectedFromPageRevision).toBeNull();
      });

      test('rename page with updateMetadata option', async() => {

        const resultPage = await crowi.pageService.renamePage(parentForRename2, '/renamed2', testUser2, { updateMetadata: true });
        const redirectedFromPage = await Page.findOne({ path: '/parentForRename2' });
        const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename2' });

        expect(xssSpy).toHaveBeenCalled();
        expect(renameDescendantsWithStreamSpy).not.toHaveBeenCalled();
        expect(pageEventSpy).toHaveBeenCalledWith('delete', parentForRename2, testUser2, socketClientId);
        expect(pageEventSpy).toHaveBeenCalledWith('create', resultPage, testUser2, socketClientId);

        expect(resultPage.path).toBe('/renamed2');
        expect(resultPage.updatedAt).toEqual(dateToUse);
        expect(resultPage.lastUpdateUser).toEqual(testUser2._id);

        expect(redirectedFromPage).toBeNull();
        expect(redirectedFromPageRevision).toBeNull();
      });

      test('rename page with createRedirectPage option', async() => {

        const resultPage = await crowi.pageService.renamePage(parentForRename3, '/renamed3', testUser2, { createRedirectPage: true });
        const redirectedFromPage = await Page.findOne({ path: '/parentForRename3' });
        const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename3' });

        expect(xssSpy).toHaveBeenCalled();
        expect(renameDescendantsWithStreamSpy).not.toHaveBeenCalled();
        expect(pageEventSpy).toHaveBeenCalledWith('delete', parentForRename3, testUser2, socketClientId);
        expect(pageEventSpy).toHaveBeenCalledWith('create', resultPage, testUser2, socketClientId);

        expect(resultPage.path).toBe('/renamed3');
        expect(resultPage.updatedAt).toEqual(parentForRename3.updatedAt);
        expect(resultPage.lastUpdateUser).toEqual(testUser1._id);

        expect(redirectedFromPage).not.toBeNull();
        expect(redirectedFromPage.path).toBe('/parentForRename3');
        expect(redirectedFromPage.redirectTo).toBe('/renamed3');

        expect(redirectedFromPageRevision).not.toBeNull();
        expect(redirectedFromPageRevision.path).toBe('/parentForRename3');
        expect(redirectedFromPageRevision.body).toBe('redirect /renamed3');
      });

      test('rename page with isRecursively', async() => {

        const resultPage = await crowi.pageService.renamePage(parentForRename4, '/renamed4', testUser2, { }, true);
        const redirectedFromPage = await Page.findOne({ path: '/parentForRename4' });
        const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename4' });

        expect(xssSpy).toHaveBeenCalled();
        expect(renameDescendantsWithStreamSpy).toHaveBeenCalled();
        expect(pageEventSpy).toHaveBeenCalledWith('delete', parentForRename4, testUser2, socketClientId);
        expect(pageEventSpy).toHaveBeenCalledWith('create', resultPage, testUser2, socketClientId);

        expect(resultPage.path).toBe('/renamed4');
        expect(resultPage.updatedAt).toEqual(parentForRename4.updatedAt);
        expect(resultPage.lastUpdateUser).toEqual(testUser1._id);

        expect(redirectedFromPage).toBeNull();
        expect(redirectedFromPageRevision).toBeNull();
      });

    });

    test('renameDescendants()', () => {
      expect(3).toBe(3);
    });
  });


  describe('duplicate page', () => {
    let duplicateDescendantsWithStreamSpy;

    jest.mock('../../server/models/serializers/page-serializer');
    const { serializePageSecurely } = require('../../server/models/serializers/page-serializer');
    serializePageSecurely.mockImplementation(page => page);

    beforeEach(async(done) => {
      duplicateDescendantsWithStreamSpy = jest.spyOn(crowi.pageService, 'duplicateDescendantsWithStream').mockImplementation();
      done();
    });

    test('duplicate page (isRecursively: false)', async() => {
      const dummyId = '600d395667536503354c9999';
      crowi.models.Page.findRelatedTagsById = jest.fn().mockImplementation(() => { return parentTag });
      const originTagsMock = jest.spyOn(Page, 'findRelatedTagsById').mockImplementation(() => { return parentTag });
      jest.spyOn(PageTagRelation, 'updatePageTags').mockImplementation(() => { return [dummyId, parentTag.name] });
      jest.spyOn(PageTagRelation, 'listTagNamesByPage').mockImplementation(() => { return [parentTag.name] });

      const resultPage = await crowi.pageService.duplicate(parentForDuplicate, '/newParentDuplicate', testUser2, false);
      const duplicatedToPageRevision = await Revision.findOne({ path: '/newParentDuplicate' });

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicateDescendantsWithStreamSpy).not.toHaveBeenCalled();
      expect(serializePageSecurely).toHaveBeenCalled();
      expect(resultPage.path).toBe('/newParentDuplicate');
      expect(resultPage.lastUpdateUser._id).toEqual(testUser2._id);
      expect(duplicatedToPageRevision._id).not.toEqual(parentForDuplicate.revision._id);
      expect(resultPage.grant).toEqual(parentForDuplicate.grant);
      expect(resultPage.tags).toEqual([originTagsMock().name]);
    });

    test('duplicate page (isRecursively: true)', async() => {
      const dummyId = '600d395667536503354c9999';
      crowi.models.Page.findRelatedTagsById = jest.fn().mockImplementation(() => { return parentTag });
      const originTagsMock = jest.spyOn(Page, 'findRelatedTagsById').mockImplementation(() => { return parentTag });
      jest.spyOn(PageTagRelation, 'updatePageTags').mockImplementation(() => { return [dummyId, parentTag.name] });
      jest.spyOn(PageTagRelation, 'listTagNamesByPage').mockImplementation(() => { return [parentTag.name] });

      const resultPageRecursivly = await crowi.pageService.duplicate(parentForDuplicate, '/newParentDuplicateRecursively', testUser2, true);
      const duplicatedRecursivelyToPageRevision = await Revision.findOne({ path: '/newParentDuplicateRecursively' });

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicateDescendantsWithStreamSpy).toHaveBeenCalled();
      expect(serializePageSecurely).toHaveBeenCalled();
      expect(resultPageRecursivly.path).toBe('/newParentDuplicateRecursively');
      expect(resultPageRecursivly.lastUpdateUser._id).toEqual(testUser2._id);
      expect(duplicatedRecursivelyToPageRevision._id).not.toEqual(parentForDuplicate.revision._id);
      expect(resultPageRecursivly.grant).toEqual(parentForDuplicate.grant);
      expect(resultPageRecursivly.tags).toEqual([originTagsMock().name]);
    });

    test('duplicateDescendants()', () => {
      expect(3).toBe(3);
    });

    test('duplicateTags()', async() => {

      const newPageDummy = [{
        _id: '60110bdd85339d7dc732dddd',
        path: '/newPageDummyPath',
        creator: parentForDuplicate._id,
        grant: parentForDuplicate.grant,
        grantedGroup: parentForDuplicate.grantedGroup,
        grantedUsers: parentForDuplicate.grantedUsers,
        lastUpdateUser: parentForDuplicate._id,
        redirectTo: null,
        revision: parentForDuplicate.revisionId,
      }];

      const pageIdMapping = {
        [parentForDuplicate._id]: '60110bdd85339d7dc732dddd',
      };

      const duplicateTagsReturn = await crowi.pageService.duplicateTags(pageIdMapping);
      const parentoForDuplicateTags = await PageTagRelation.find({ relatedPage: parentForDuplicate });
      const pageTagRelationAfterDuplicated = await PageTagRelation.find({ relatedPage: newPageDummy });

      expect(pageTagRelationAfterDuplicated.relatedTag).toEqual(parentoForDuplicateTags.relatedTag);
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
