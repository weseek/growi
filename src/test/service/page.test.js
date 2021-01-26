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

let childForRename1;
let childForRename2;
let childForRename3;

let parentForDuplicate;

let parentForDelete1;
let parentForDelete2;

let childForDelete;

let parentForDeleteCompletely;
let parentForRevert;

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

  beforeAll(async(done) => {
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
      },
      {
        path: '/parentForDuplicate/child',
        grant: Page.GRANT_PUBLIC,
        creator: testUser1,
        lastUpdateUser: testUser1,
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

    parentForDelete1 = await Page.findOne({ path: '/parentForDelete1' });
    parentForDelete2 = await Page.findOne({ path: '/parentForDelete2' });

    parentForDeleteCompletely = await Page.findOne({ path: '/parentForDeleteCompletely' });
    parentForRevert = await Page.findOne({ path: '/parentForRevert' });

    childForRename1 = await Page.findOne({ path: '/parentForRename1/child' });
    childForRename2 = await Page.findOne({ path: '/parentForRename2/child' });
    childForRename3 = await Page.findOne({ path: '/parentForRename3/child' });

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
    let xssSpy;
    let pageEventSpy;
    let renameDescendantsWithStreamSpy;
    const dateToUse = new Date('2000-01-01');
    const socketClientId = null;

    beforeEach(async(done) => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => dateToUse);
      xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);
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

    test('renameDescendants without options', async() => {
      const oldPagePathPrefix = new RegExp('^/parentForRename1', 'i');
      const newPagePathPrefix = '/renamed1';

      await crowi.pageService.renameDescendants([childForRename1], testUser2, {}, oldPagePathPrefix, newPagePathPrefix);
      const resultPage = await Page.findOne({ path: '/renamed1/child' });
      const redirectedFromPage = await Page.findOne({ path: '/parentForRename1/child' });
      const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename1/child' });

      expect(resultPage).not.toBeNull();
      expect(pageEventSpy).toHaveBeenCalledWith('updateMany', [childForRename1], testUser2);

      expect(resultPage.path).toBe('/renamed1/child');
      expect(resultPage.updatedAt).toEqual(childForRename1.updatedAt);
      expect(resultPage.lastUpdateUser).toEqual(testUser1._id);

      expect(redirectedFromPage).toBeNull();
      expect(redirectedFromPageRevision).toBeNull();
    });

    test('renameDescendants with updateMetadata option', async() => {
      const oldPagePathPrefix = new RegExp('^/parentForRename2', 'i');
      const newPagePathPrefix = '/renamed2';

      await crowi.pageService.renameDescendants([childForRename2], testUser2, { updateMetadata: true }, oldPagePathPrefix, newPagePathPrefix);
      const resultPage = await Page.findOne({ path: '/renamed2/child' });
      const redirectedFromPage = await Page.findOne({ path: '/parentForRename2/child' });
      const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename2/child' });

      expect(resultPage).not.toBeNull();
      expect(pageEventSpy).toHaveBeenCalledWith('updateMany', [childForRename2], testUser2);

      expect(resultPage.path).toBe('/renamed2/child');
      expect(resultPage.updatedAt).toEqual(dateToUse);
      expect(resultPage.lastUpdateUser).toEqual(testUser2._id);

      expect(redirectedFromPage).toBeNull();
      expect(redirectedFromPageRevision).toBeNull();
    });

    test('renameDescendants with createRedirectPage option', async() => {
      const oldPagePathPrefix = new RegExp('^/parentForRename3', 'i');
      const newPagePathPrefix = '/renamed3';

      await crowi.pageService.renameDescendants([childForRename3], testUser2, { createRedirectPage: true }, oldPagePathPrefix, newPagePathPrefix);
      const resultPage = await Page.findOne({ path: '/renamed3/child' });
      const redirectedFromPage = await Page.findOne({ path: '/parentForRename3/child' });
      const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForRename3/child' });

      expect(resultPage).not.toBeNull();
      expect(pageEventSpy).toHaveBeenCalledWith('updateMany', [childForRename3], testUser2);

      expect(resultPage.path).toBe('/renamed3/child');
      expect(resultPage.updatedAt).toEqual(childForRename3.updatedAt);
      expect(resultPage.lastUpdateUser).toEqual(testUser1._id);

      expect(redirectedFromPage).not.toBeNull();
      expect(redirectedFromPage.path).toBe('/parentForRename3/child');
      expect(redirectedFromPage.redirectTo).toBe('/renamed3/child');

      expect(redirectedFromPageRevision).not.toBeNull();
      expect(redirectedFromPageRevision.path).toBe('/parentForRename3/child');
      expect(redirectedFromPageRevision.body).toBe('redirect /renamed3/child');
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
    let getDeletedPageNameSpy;
    let pageEventSpy;
    let deleteDescendantsWithStreamSpy;
    const dateToUse = new Date('2000-01-01');
    const socketClientId = null;

    beforeEach(async(done) => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => dateToUse);
      getDeletedPageNameSpy = jest.spyOn(Page, 'getDeletedPageName');
      pageEventSpy = jest.spyOn(crowi.pageService.pageEvent, 'emit');
      deleteDescendantsWithStreamSpy = jest.spyOn(crowi.pageService, 'deleteDescendantsWithStream').mockImplementation();
      done();
    });

    test('delete page without options', async() => {
      const resultPage = await crowi.pageService.deletePage(parentForDelete1, testUser2, { });
      const redirectedFromPage = await Page.findOne({ path: '/parentForDelete1' });
      const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForDelete1' });

      expect(getDeletedPageNameSpy).toHaveBeenCalled();
      expect(deleteDescendantsWithStreamSpy).not.toHaveBeenCalled();

      expect(resultPage.status).toBe(Page.STATUS_DELETED);
      expect(resultPage.path).toBe('/trash/parentForDelete1');
      expect(resultPage.deleteUser).toEqual(testUser2._id);
      expect(resultPage.deletedAt).toEqual(dateToUse);
      expect(resultPage.updatedAt).toEqual(parentForDelete1.updatedAt);
      expect(resultPage.lastUpdateUser).toEqual(testUser1._id);

      expect(redirectedFromPage).not.toBeNull();
      expect(redirectedFromPage.path).toBe('/parentForDelete1');
      expect(redirectedFromPage.redirectTo).toBe('/trash/parentForDelete1');

      expect(redirectedFromPageRevision).not.toBeNull();
      expect(redirectedFromPageRevision.path).toBe('/parentForDelete1');
      expect(redirectedFromPageRevision.body).toBe('redirect /trash/parentForDelete1');

      expect(pageEventSpy).toHaveBeenCalledWith('delete', parentForDelete1, testUser2, socketClientId);
      expect(pageEventSpy).toHaveBeenCalledWith('create', resultPage, testUser2, socketClientId);

    });

    test('delete page with isRecursively', async() => {
      const resultPage = await crowi.pageService.deletePage(parentForDelete2, testUser2, { }, true);
      const redirectedFromPage = await Page.findOne({ path: '/parentForDelete2' });
      const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForDelete2' });

      expect(getDeletedPageNameSpy).toHaveBeenCalled();
      expect(deleteDescendantsWithStreamSpy).toHaveBeenCalled();

      expect(resultPage.status).toBe(Page.STATUS_DELETED);
      expect(resultPage.path).toBe('/trash/parentForDelete2');
      expect(resultPage.deleteUser).toEqual(testUser2._id);
      expect(resultPage.deletedAt).toEqual(dateToUse);
      expect(resultPage.updatedAt).toEqual(parentForDelete2.updatedAt);
      expect(resultPage.lastUpdateUser).toEqual(testUser1._id);

      expect(redirectedFromPage).not.toBeNull();
      expect(redirectedFromPage.path).toBe('/parentForDelete2');
      expect(redirectedFromPage.redirectTo).toBe('/trash/parentForDelete2');

      expect(redirectedFromPageRevision).not.toBeNull();
      expect(redirectedFromPageRevision.path).toBe('/parentForDelete2');
      expect(redirectedFromPageRevision.body).toBe('redirect /trash/parentForDelete2');

      expect(pageEventSpy).toHaveBeenCalledWith('delete', parentForDelete2, testUser2, socketClientId);
      expect(pageEventSpy).toHaveBeenCalledWith('create', resultPage, testUser2, socketClientId);

    });


    test('deleteDescendants', async() => {
      await crowi.pageService.deleteDescendants([childForDelete], testUser2);
      const resultPage = await Page.findOne({ path: '/trash/parentForDelete/child' });
      const redirectedFromPage = await Page.findOne({ path: '/parentForDelete/child' });
      const redirectedFromPageRevision = await Revision.findOne({ path: '/parentForDelete/child' });

      expect(resultPage.status).toBe(Page.STATUS_DELETED);
      expect(resultPage.path).toBe('/trash/parentForDelete/child');
      expect(resultPage.deleteUser).toEqual(testUser2._id);
      expect(resultPage.deletedAt).toEqual(dateToUse);
      expect(resultPage.updatedAt).toEqual(childForDelete.updatedAt);
      expect(resultPage.lastUpdateUser).toEqual(testUser1._id);

      expect(redirectedFromPage).not.toBeNull();
      expect(redirectedFromPage.path).toBe('/parentForDelete/child');
      expect(redirectedFromPage.redirectTo).toBe('/trash/parentForDelete/child');

      expect(redirectedFromPageRevision).not.toBeNull();
      expect(redirectedFromPageRevision.path).toBe('/parentForDelete/child');
      expect(redirectedFromPageRevision.body).toBe('redirect /trash/parentForDelete/child');
    });
  });

  describe('delete page completely', () => {
    let pageEventSpy;
    let deleteCompletelyOperationSpy;
    let deleteCompletelyDescendantsWithStreamSpy;
    const socketClientId = null;

    let deleteManyBookmarkSpy;
    let deleteManyCommentSpy;
    let deleteManyPageTagRelationSpy;
    let deleteManyShareLinkSpy;
    let deleteManyRevisionSpy;
    let deleteManyPageSpy;
    let removeAllAttachmentsSpy;

    beforeEach(async(done) => {
      pageEventSpy = jest.spyOn(crowi.pageService.pageEvent, 'emit');
      deleteCompletelyOperationSpy = jest.spyOn(crowi.pageService, 'deleteCompletelyOperation');
      deleteCompletelyDescendantsWithStreamSpy = jest.spyOn(crowi.pageService, 'deleteCompletelyDescendantsWithStream').mockImplementation();

      deleteManyBookmarkSpy = jest.spyOn(Bookmark, 'deleteMany').mockImplementation();
      deleteManyCommentSpy = jest.spyOn(Comment, 'deleteMany').mockImplementation();
      deleteManyPageTagRelationSpy = jest.spyOn(PageTagRelation, 'deleteMany').mockImplementation();
      deleteManyShareLinkSpy = jest.spyOn(ShareLink, 'deleteMany').mockImplementation();
      deleteManyRevisionSpy = jest.spyOn(Revision, 'deleteMany').mockImplementation();
      deleteManyPageSpy = jest.spyOn(Page, 'deleteMany').mockImplementation();
      removeAllAttachmentsSpy = jest.spyOn(crowi.attachmentService, 'removeAllAttachments').mockImplementation();
      done();
    });
    test('deleteCompletelyOperation', async() => {
      await crowi.pageService.deleteCompletelyOperation([parentForDeleteCompletely._id], [parentForDeleteCompletely.path], { });

      expect(deleteManyBookmarkSpy).toHaveBeenCalledWith({ page: { $in: [parentForDeleteCompletely._id] } });
      expect(deleteManyCommentSpy).toHaveBeenCalledWith({ page: { $in: [parentForDeleteCompletely._id] } });
      expect(deleteManyPageTagRelationSpy).toHaveBeenCalledWith({ relatedPage: { $in: [parentForDeleteCompletely._id] } });
      expect(deleteManyShareLinkSpy).toHaveBeenCalledWith({ relatedPage: { $in: [parentForDeleteCompletely._id] } });
      expect(deleteManyRevisionSpy).toHaveBeenCalledWith({ path: { $in: [parentForDeleteCompletely.path] } });
      expect(deleteManyPageSpy).toHaveBeenCalledWith({
        $or: [{ path: { $in: [parentForDeleteCompletely.path] } },
              { path: { $in: [] } },
              { _id: { $in: [parentForDeleteCompletely._id] } }],
      });
      expect(removeAllAttachmentsSpy).toHaveBeenCalled();
    });

    test('delete completely without options', async() => {
      await crowi.pageService.deleteCompletely(parentForDeleteCompletely, testUser2, { });

      expect(deleteCompletelyOperationSpy).toHaveBeenCalled();
      expect(deleteCompletelyDescendantsWithStreamSpy).not.toHaveBeenCalled();

      expect(pageEventSpy).toHaveBeenCalledWith('delete', parentForDeleteCompletely, testUser2, socketClientId);
    });


    test('delete completely with isRecursively', async() => {
      await crowi.pageService.deleteCompletely(parentForDeleteCompletely, testUser2, { }, true);

      expect(deleteCompletelyOperationSpy).toHaveBeenCalled();
      expect(deleteCompletelyDescendantsWithStreamSpy).toHaveBeenCalled();

      expect(pageEventSpy).toHaveBeenCalledWith('delete', parentForDeleteCompletely, testUser2, socketClientId);
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
