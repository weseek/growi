/* eslint-disable no-unused-vars */
import { advanceTo } from 'jest-date-mock';

import mongoose from 'mongoose';

import { getInstance } from '../setup-crowi';

describe('PageService page operations with only public pages', () => {

  let dummyUser1;
  let dummyUser2;

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

  // pass unless the data is one of [false, 0, '', null, undefined, NaN]
  const expectAllToBeTruthy = (dataList) => {
    dataList.forEach((data) => {
      expect(data).toBeTruthy();
    });
  };

  beforeAll(async() => {
    crowi = await getInstance();
    await crowi.configManager.updateConfigsInTheSameNamespace('crowi', { 'app:isV5Compatible': true });

    User = mongoose.model('User');
    Page = mongoose.model('Page');
    Revision = mongoose.model('Revision');
    Tag = mongoose.model('Tag');
    PageTagRelation = mongoose.model('PageTagRelation');
    Bookmark = mongoose.model('Bookmark');
    Comment = mongoose.model('Comment');
    ShareLink = mongoose.model('ShareLink');
    PageRedirect = mongoose.model('PageRedirect');

    /*
     * Common
     */
    await User.insertMany([
      { name: 'dummyUser1', username: 'dummyUser1', email: 'dummyUser1@example.com' },
      { name: 'dummyUser2', username: 'dummyUser2', email: 'dummyUser2@example.com' },
    ]);

    dummyUser1 = await User.findOne({ username: 'dummyUser1' });
    dummyUser2 = await User.findOne({ username: 'dummyUser2' });

    xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);

    /*
     * Rename
     */
    // delete root page if any created by other test file
    const pages = await Page.find({ path: '/' });
    if (pages.length > 0) {
      await Page.deleteOne({ path: '/' });
    }
    // then create new root page
    rootPage = await Page.create('/', 'body', dummyUser1._id, {});
    // then create user's page
    await Page.insertMany([
      {
        path: '/user',
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
    ]);

    await Page.create('/user/dummyUser1', 'dummyUser1_page', dummyUser1._id, {});
    await Page.create('/user/dummyUser2', 'dummyUser2_page', dummyUser2._id, {});

    const pageIdForRename1 = new mongoose.Types.ObjectId();
    const pageIdForRename2 = new mongoose.Types.ObjectId();
    const pageIdForRename3 = new mongoose.Types.ObjectId();
    const pageIdForRename4 = new mongoose.Types.ObjectId();
    const pageIdForRename5 = new mongoose.Types.ObjectId();

    const pageIdForRename7 = new mongoose.Types.ObjectId();
    const pageIdForRename8 = new mongoose.Types.ObjectId();
    const pageIdForRename9 = new mongoose.Types.ObjectId();
    const pageIdForRename10 = new mongoose.Types.ObjectId();
    const pageIdForRename11 = new mongoose.Types.ObjectId();
    const pageIdForRename12 = new mongoose.Types.ObjectId();
    const pageIdForRename13 = new mongoose.Types.ObjectId();
    const pageIdForRename14 = new mongoose.Types.ObjectId();

    const pageIdForRename16 = new mongoose.Types.ObjectId();

    // Create Pages
    await Page.insertMany([
      // parents
      {
        _id: pageIdForRename1,
        path: '/v5_ParentForRename1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename2,
        path: '/v5_ParentForRename2',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        // id not needed for this data
        path: '/v5_ParentForRename2/dummyChild1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForRename2,
      },
      {
        _id: pageIdForRename3,
        path: '/v5_ParentForRename3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename4,
        path: '/v5_ParentForRename4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename5,
        path: '/v5_ParentForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename7,
        path: '/v5_ParentForRename7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename8,
        path: '/v5_ParentForRename8',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename9,
        path: '/v5_ParentForRename9',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      // children
      {
        _id: pageIdForRename10,
        path: '/v5_ChildForRename1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename11,
        path: '/v5_ChildForRename2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename12,
        path: '/v5_ChildForRename3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        updatedAt: new Date('2021'),
      },
      {
        _id: pageIdForRename13,
        path: '/v5_ChildForRename4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename14,
        path: '/v5_ChildForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        _id: pageIdForRename16,
        path: '/v5_ChildForRename7',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
      // Grandchild
      {
        path: '/v5_ChildForRename5/v5_GrandchildForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForRename14,
        updatedAt: new Date('2021'),
      },
      {
        path: '/v5_ChildForRename7/v5_GrandchildForRename7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForRename16,
      },
    ]);

    /**
     * Delete
     */
    const pageIdForDelete1 = new mongoose.Types.ObjectId();
    const pageIdForDelete2 = new mongoose.Types.ObjectId();
    const pageIdForDelete3 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        path: '/trash/v5_PageForDelete1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_DELETED,
      },
      {
        path: '/v5_PageForDelete2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDelete1,
        path: '/v5_PageForDelete3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDelete2,
        path: '/v5_PageForDelete3/v5_PageForDelete4',
        grant: Page.GRANT_PUBLIC,
        parent: pageIdForDelete1,
        status: Page.STATUS_PUBLISHED,
        isEmpty: true,
      },
      {
        path: '/v5_PageForDelete3/v5_PageForDelete4/v5_PageForDelete5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDelete2,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDelete3,
        path: '/v5_PageForDelete6',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
    ]);

    const tagIdForDelete1 = new mongoose.Types.ObjectId();
    const tagIdForDelete2 = new mongoose.Types.ObjectId();

    await Tag.insertMany([
      { _id: tagIdForDelete1, name: 'TagForDelete1' },
      { _id: tagIdForDelete2, name: 'TagForDelete2' },
    ]);

    await PageTagRelation.insertMany([
      { relatedPage: pageIdForDelete3, relatedTag: tagIdForDelete1 },
      { relatedPage: pageIdForDelete3, relatedTag: tagIdForDelete2 },
    ]);

    /**
     * Delete completely
     */
    const pageIdForDeleteCompletely1 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely2 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely3 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely4 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely5 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely6 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely7 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely8 = new mongoose.Types.ObjectId();

    const revisionIdForDeleteCompletely1 = new mongoose.Types.ObjectId();
    const revisionIdForDeleteCompletely2 = new mongoose.Types.ObjectId();
    const revisionIdForDeleteCompletely3 = new mongoose.Types.ObjectId();
    const revisionIdForDeleteCompletely4 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        _id: pageIdForDeleteCompletely1,
        path: '/v5_PageForDeleteCompletely1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDeleteCompletely2,
        path: '/v5_PageForDeleteCompletely2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDeleteCompletely3,
        path: '/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3',
        grant: Page.GRANT_PUBLIC,
        parent: pageIdForDeleteCompletely2,
        status: Page.STATUS_PUBLISHED,
        isEmpty: true,
      },
      {
        _id: pageIdForDeleteCompletely4,
        path: '/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3/v5_PageForDeleteCompletely4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDeleteCompletely3,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDeleteCompletely5,
        path: '/trash/v5_PageForDeleteCompletely5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_DELETED,
      },
      {
        _id: pageIdForDeleteCompletely6,
        path: '/v5_PageForDeleteCompletely6',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDeleteCompletely7,
        path: '/v5_PageForDeleteCompletely6/v5_PageForDeleteCompletely7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDeleteCompletely6,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDeleteCompletely8,
        path: '/v5_PageForDeleteCompletely6/v5_PageForDeleteCompletely7/v5_PageForDeleteCompletely8',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDeleteCompletely7,
        status: Page.STATUS_PUBLISHED,
      },
    ]);

    await Revision.insertMany([
      {
        _id: revisionIdForDeleteCompletely1,
        format: 'markdown',
        pageId: pageIdForDeleteCompletely2,
        body: 'pageIdForDeleteCompletely2',
      },
      {
        _id: revisionIdForDeleteCompletely2,
        format: 'markdown',
        pageId: pageIdForDeleteCompletely4,
        body: 'pageIdForDeleteCompletely4',
      },
      {
        _id: revisionIdForDeleteCompletely3,
        format: 'markdown',
        pageId: pageIdForDeleteCompletely5,
        body: 'pageIdForDeleteCompletely5',
      },
      {
        _id: revisionIdForDeleteCompletely4,
        format: 'markdown',
        pageId: pageIdForDeleteCompletely2,
        body: 'comment_pageIdForDeleteCompletely3',
      },
    ]);

    const tagForDeleteCompletely1 = new mongoose.Types.ObjectId();
    const tagForDeleteCompletely2 = new mongoose.Types.ObjectId();
    await Tag.insertMany([
      { name: 'TagForDeleteCompletely1' },
      { name: 'TagForDeleteCompletely2' },
    ]);

    await PageTagRelation.insertMany([
      { relatedPage: pageIdForDeleteCompletely2, relatedTag: tagForDeleteCompletely1 },
      { relatedPage: pageIdForDeleteCompletely4, relatedTag: tagForDeleteCompletely2 },
    ]);

    await Bookmark.insertMany([
      {
        page: pageIdForDeleteCompletely2,
        user: dummyUser1._id,
      },
      {
        page: pageIdForDeleteCompletely2,
        user: dummyUser2._id,
      },
    ]);

    await Comment.insertMany([
      {
        commentPosition: -1,
        isMarkdown: true,
        page: pageIdForDeleteCompletely2,
        creator: dummyUser1._id,
        revision: revisionIdForDeleteCompletely4,
        comment: 'comment_ForDeleteCompletely4',
      },
    ]);

    await PageRedirect.insertMany([
      {
        fromPath: '/from/v5_PageForDeleteCompletely2',
        toPath: '/v5_PageForDeleteCompletely2',
      },
      {
        fromPath: '/from/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3/v5_PageForDeleteCompletely4',
        toPath: '/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3/v5_PageForDeleteCompletely4',
      },
    ]);

    await ShareLink.insertMany([
      {
        relatedPage: pageIdForDeleteCompletely2,
        expiredAt: null,
        description: 'sharlink_v5PageForDeleteCompletely2',
      },
      {
        relatedPage: pageIdForDeleteCompletely4,
        expiredAt: null,
        description: 'sharlink_v5PageForDeleteCompletely4',
      },
    ]);

  });

  describe('Rename', () => {

    const renamePage = async(page, newPagePath, user, options) => {
    // mock return value
      const mockedResumableRenameDescendants = jest.spyOn(crowi.pageService, 'resumableRenameDescendants').mockReturnValue(null);
      const mockedCreateAndSendNotifications = jest.spyOn(crowi.pageService, 'createAndSendNotifications').mockReturnValue(null);
      const renamedPage = await crowi.pageService.renamePage(page, newPagePath, user, options);

      // retrieve the arguments passed when calling method resumableRenameDescendants inside renamePage method
      const argsForResumableRenameDescendants = mockedResumableRenameDescendants.mock.calls[0];

      // restores the original implementation
      mockedResumableRenameDescendants.mockRestore();
      mockedCreateAndSendNotifications.mockRestore();

      // rename descendants
      await crowi.pageService.resumableRenameDescendants(...argsForResumableRenameDescendants);

      return renamedPage;
    };

    test('Should NOT rename top page', async() => {
      expectAllToBeTruthy([rootPage]);
      let isThrown = false;
      try {
        await crowi.pageService.renamePage(rootPage, '/new_root', dummyUser1, {});
      }
      catch (err) {
        isThrown = true;
      }

      expect(isThrown).toBe(true);
    });

    test('Should rename/move to under non-empty page', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename1' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename1' });
      expectAllToBeTruthy([childPage, parentPage]);

      const newPath = '/v5_ParentForRename1/renamedChildForRename1';
      const renamedPage = await renamePage(childPage, newPath, dummyUser1, {});

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);

    });

    test('Should rename/move to under empty page', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename2' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename2' });
      expectAllToBeTruthy([childPage, parentPage]);
      expect(parentPage.isEmpty).toBe(true);

      const newPath = '/v5_ParentForRename2/renamedChildForRename2';
      const renamedPage = await renamePage(childPage, newPath, dummyUser1, {});

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(parentPage.isEmpty).toBe(true);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
    });

    test('Should rename/move with option updateMetadata: true', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename3' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename3' });
      expectAllToBeTruthy([childPage, parentPage]);
      expect(childPage.lastUpdateUser).toStrictEqual(dummyUser1._id);

      const newPath = '/v5_ParentForRename3/renamedChildForRename3';
      const oldUdpateAt = childPage.updatedAt;
      const renamedPage = await renamePage(childPage, newPath, dummyUser2, { updateMetadata: true });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
      expect(renamedPage.lastUpdateUser).toStrictEqual(dummyUser2._id);
      expect(renamedPage.updatedAt.getFullYear()).toBeGreaterThan(oldUdpateAt.getFullYear());
    });

    // ****************** TODO ******************
    // uncomment the next test when working on 88097
    // ******************************************
    // test('Should move with option createRedirectPage: true', async() => {
    // const parentPage = await Page.findOne({ path: '/v5_ParentForRename4' });
    // const childPage = await Page.findOne({ path: '/v5_ChildForRename4' });
    // expectAllToBeTruthy([parentPage, childPage]);

    //   // rename target page
    //   const newPath = '/v5_ParentForRename4/renamedChildForRename4';
    //   const renamedPage = await renamePage(childPage, newPath, dummyUser2, { createRedirectPage: true });
    //   const pageRedirect = await PageRedirect.find({ fromPath: childPage.path, toPath: renamedPage.path });

    // expect(xssSpy).toHaveBeenCalled();
    //   expect(renamedPage.path).toBe(newPath);
    //   expect(renamedPage.parent).toStrictEqual(parentPage._id);
    //   expect(pageRedirect.length).toBeGreaterThan(0);
    // });

    test('Should rename/move with descendants', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename5' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename5' });
      expectAllToBeTruthy([parentPage, childPage]);

      const newPath = '/v5_ParentForRename5/renamedChildForRename5';
      const renamedPage = await renamePage(childPage, newPath, dummyUser1, {});
      // find child of renamed page
      const grandchild = await Page.findOne({ parent: renamedPage._id });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
      // grandchild's parent should be the renamed page
      expect(grandchild.parent).toStrictEqual(renamedPage._id);
      expect(grandchild.path).toBe('/v5_ParentForRename5/renamedChildForRename5/v5_GrandchildForRename5');
    });

    test('Should rename/move empty page', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename7' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename7' });
      expectAllToBeTruthy([parentPage, childPage]);
      expect(childPage.isEmpty).toBe(true);

      const newPath = '/v5_ParentForRename7/renamedChildForRename7';
      const renamedPage = await renamePage(childPage, newPath, dummyUser1, {});
      const grandchild = await Page.findOne({ parent: renamedPage._id });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.isEmpty).toBe(true);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
      // grandchild's parent should be renamed page
      expect(grandchild.parent).toStrictEqual(renamedPage._id);
      expect(grandchild.path).toBe('/v5_ParentForRename7/renamedChildForRename7/v5_GrandchildForRename7');
    });
    test('Should NOT rename/move with existing path', async() => {
      const page = await Page.findOne({ path: '/v5_ParentForRename8' });
      expectAllToBeTruthy([page]);

      const newPath = '/v5_ParentForRename9';
      let isThrown;
      try {
        await renamePage(page, newPath, dummyUser1, {});
      }
      catch (err) {
        isThrown = true;
      }

      expect(isThrown).toBe(true);
    });
  });
  describe('Delete', () => {
    const deletePage = async(page, user, options, isRecursively) => {
      const mockedResumableDeleteDescendants = jest.spyOn(crowi.pageService, 'resumableDeleteDescendants').mockReturnValue(null);
      const mockedCreateAndSendNotifications = jest.spyOn(crowi.pageService, 'createAndSendNotifications').mockReturnValue(null);

      const deletedPage = await crowi.pageService.deletePage(page, user, options, isRecursively);

      const argsForResumableDeleteDescendants = mockedResumableDeleteDescendants.mock.calls[0];

      mockedResumableDeleteDescendants.mockRestore();
      mockedCreateAndSendNotifications.mockRestore();

      if (isRecursively) {
        await crowi.pageService.resumableDeleteDescendants(...argsForResumableDeleteDescendants);
      }

      return deletedPage;
    };
    test('Should NOT delete root page', async() => {
      let isThrown;
      expectAllToBeTruthy([rootPage]);

      try { await deletePage(rootPage, dummyUser1, {}, false) }
      catch (err) { isThrown = true }

      expect(isThrown).toBe(true);
    });
    test('Should NOT delete trashed page', async() => {
      const page = await Page.findOne({ path: '/trash/v5_PageForDelete1' });
      expectAllToBeTruthy([page]);

      let isThrown;
      try { await deletePage(page, dummyUser1, {}, false) }
      catch (err) { isThrown = true }

      expect(isThrown).toBe(true);
    });
    test('Should NOT delete /user/hoge page', async() => {
      const dummyUser1Page = await Page.findOne({ username: 'dummyUser1' });
      expectAllToBeTruthy([dummyUser1Page]);

      let isThrown;
      try { await deletePage(dummyUser1Page, dummyUser1, {}, false) }
      catch (err) { isThrown = true }

      expect(isThrown).toBe(true);
    });
    test('Should delete single page', async() => {
      const page = await Page.findOne({ path: '/v5_PageForDelete2' });
      expectAllToBeTruthy([page]);

      const deletedPage = await deletePage(page, dummyUser1, {}, false);

      expect(deletedPage.path).toBe(`/trash${page.path}`);
      expect(deletedPage.parent).toBeNull();
      expect(deletedPage.status).toBe(Page.STATUS_DELETED);
    });
    test('Should delete multiple pages including empty child', async() => {
      const parentPage = await Page.findOne({ path: '/v5_PageForDelete3' });
      const childPage = await Page.findOne({ path: '/v5_PageForDelete3/v5_PageForDelete4' });
      const grandchildPage = await Page.findOne({ path: '/v5_PageForDelete3/v5_PageForDelete4/v5_PageForDelete5' });
      expectAllToBeTruthy([parentPage, childPage, grandchildPage]);

      const deletedParentPage = await deletePage(parentPage, dummyUser1, {}, true);
      const deletedChildPage = await Page.findOne({ path: `/trash${childPage.path}` });
      const deletedGrandchildPage = await Page.findOne({ path: `/trash${grandchildPage.path}` });

      // originally NOT empty page should exist with status 'deleted' and parent set null
      expect(deletedParentPage._id).toStrictEqual(parentPage._id);
      expect(deletedParentPage.status).toBe(Page.STATUS_DELETED);
      expect(deletedParentPage.parent).toBeNull();
      // originally empty page should NOT exist
      expect(deletedChildPage).toBeNull();
      // originally NOT empty page should exist with status 'deleted' and parent set null
      expect(deletedGrandchildPage._id).toStrictEqual(grandchildPage._id);
      expect(deletedGrandchildPage.status).toBe(Page.STATUS_DELETED);
      expect(deletedGrandchildPage.parent).toBeNull();
    });
    test('Should delete page tag relation', async() => {
      const page = await Page.findOne({ path: '/v5_PageForDelete6' });
      const tag1 = await Tag.findOne({ name: 'TagForDelete1' });
      const tag2 = await Tag.findOne({ name: 'TagForDelete2' });
      const pageRelation1 = await PageTagRelation.findOne({ name: tag1.name });
      const pageRelation2 = await PageTagRelation.findOne({ name: tag2.name });
      expectAllToBeTruthy([page, tag1, tag2, pageRelation1, pageRelation2]);

      const deletedPage = await deletePage(page, dummyUser1, {}, false);
      const deletedTagRelation1 = await PageTagRelation.findOne({ _id: pageRelation1._id });
      const deletedTagRelation2 = await PageTagRelation.findOne({ _id: pageRelation2._id });

      expect(deletedPage.status).toBe(Page.STATUS_DELETED);
      expect(deletedTagRelation1.isPageTrashed).toBe(true);
      expect(deletedTagRelation2.isPageTrashed).toBe(true);
    });
  });

  describe('Delete completely', () => {
    const deleteCompletely = async(page, user, options = {}, isRecursively = false, preventEmitting = false) => {
      const mockedResumableDeleteCompletelyDescendants = jest.spyOn(crowi.pageService, 'resumableDeleteCompletelyDescendants').mockReturnValue(null);
      const mockedCreateAndSendNotifications = jest.spyOn(crowi.pageService, 'createAndSendNotifications').mockReturnValue(null);

      await crowi.pageService.deleteCompletely(page, user, options, isRecursively, preventEmitting);

      const argsForResumableDeleteDescendants = mockedResumableDeleteCompletelyDescendants.mock.calls[0];

      mockedResumableDeleteCompletelyDescendants.mockRestore();
      mockedCreateAndSendNotifications.mockRestore();

      if (isRecursively) {
        await crowi.pageService.resumableDeleteCompletelyDescendants(...argsForResumableDeleteDescendants);
      }

      return;
    };

    test('Should NOT completely delete root page', async() => {
      expectAllToBeTruthy([rootPage]);
      let isThrown;
      try {
        await deleteCompletely(rootPage, dummyUser1, {}, false);
      }
      catch (err) {
        isThrown = true;
      }

      expect(isThrown).toBe(true);
    });
    test('Should completely delete single page', async() => {
      const page = await Page.findOne({ path: '/v5_PageForDeleteCompletely1' });
      expectAllToBeTruthy([page]);

      await deleteCompletely(page, dummyUser1, {}, false);
      const deletedPage = await Page.findOne({ _id: page._id });

      expect(deletedPage).toBeNull();
    });
    test('Should completely delete multiple pages', async() => {
      const parentPage = await Page.findOne({ path: '/v5_PageForDeleteCompletely2' });
      const childPage = await Page.findOne({ path: '/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3' });
      const grandchildPage = await Page.findOne({ path: '/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3/v5_PageForDeleteCompletely4' });
      const tag1 = await Tag.findOne({ name: 'TagForDeleteCompletely1' });
      const tag2 = await Tag.findOne({ name: 'TagForDeleteCompletely2' });
      const pageTagRelation1 = await PageTagRelation.findOne({ relatedPage: parentPage._id });
      const pageTagRelation2 = await PageTagRelation.findOne({ relatedPage: grandchildPage._id });
      const bookmark = await Bookmark.findOne({ page: parentPage._id });
      const comment = await Comment.findOne({ page: parentPage._id });
      const pageRedirect1 = await PageRedirect.findOne({ toPath: parentPage.path });
      const pageRedirect2 = await PageRedirect.findOne({ toPath: grandchildPage.path });
      const shareLink1 = await ShareLink.findOne({ relatedPage: parentPage._id });
      const shareLink2 = await ShareLink.findOne({ relatedPage: grandchildPage._id });

      expectAllToBeTruthy(
        [parentPage, childPage, grandchildPage, tag1, tag2,
         pageTagRelation1, pageTagRelation2, bookmark, comment,
         pageRedirect1, pageRedirect2, shareLink1, shareLink2],
      );

      await deleteCompletely(parentPage, dummyUser1, {}, true);
      const deletedPages = await Page.find({ _id: { $in: [parentPage._id, childPage._id, grandchildPage._id] } });
      const deletedRevisions = await Revision.find({ pageId: { $in: [parentPage._id, grandchildPage._id] } });
      const tags = await Tag.find({ _id: { $in: [tag1._id, tag2._id] } });
      const deletedPageTagRelations = await PageTagRelation.find({ _id: { $in: [pageTagRelation1._id, pageTagRelation2._id] } });
      const deletedBookmarks = await Bookmark.find({ _id: bookmark._id });
      const deletedComments = await Comment.find({ _id: comment._id });
      const deletedPageRedirects = await PageRedirect.find({ _id: { $in: [pageRedirect1._id, pageRedirect2._id] } });
      const deletedShareLinks = await ShareLink.find({ _id: { $in: [shareLink1._id, shareLink2._id] } });

      // page should be null
      deletedPages.forEach((deletedPage) => {
        expect(deletedPage).toBeNull();
      });
      // revision should be null
      deletedRevisions.forEach((revision) => {
        expect(revision).toBeNull();
      });
      // tag should NOT be null
      tags.forEach((tag) => {
        expect(tag).toBeTruthy();
      });
      // pageTagRelation should be null
      deletedPageTagRelations.forEach((PTRelation) => {
        expect(PTRelation).toBeNull();
      });
      // bookmark should be null
      deletedBookmarks.forEach((bookmark) => {
        expect(bookmark).toBeNull();
      });
      // comment should be null
      deletedComments.forEach((comment) => {
        expect(comment).toBeNull();
      });
      // pageRedirect should be null
      deletedPageRedirects.forEach((pRedirect) => {
        expect(pRedirect).toBeNull();
      });
      // sharelink should be null
      deletedShareLinks.forEach((sharelnk) => {
        expect(sharelnk).toBeNull();
      });
    });
    test('Should completely delete trashed page', async() => {
      const page = await Page.findOne({ path: '/trash/v5_PageForDeleteCompletely5' });
      const revision = await Revision.findOne({ pageId: page._id });
      expectAllToBeTruthy([page, revision]);

      await deleteCompletely(page, dummyUser1, {}, false);
      const deltedPage = await Page.findOne({ _id: page._id });
      const deltedRevision = await Revision.findOne({ _id: revision._id });

      expect(deltedPage).toBeNull();
      expect(deltedRevision).toBeNull();
    });
    test('Should completely deleting page in the middle results in empty page', async() => {
      const parentPage = await Page.findOne({ path: '/v5_PageForDeleteCompletely6' });
      const childPage = await Page.findOne({ path: '/v5_PageForDeleteCompletely6/v5_PageForDeleteCompletely7' });
      const grandchildPage = await Page.findOne({ path: '/v5_PageForDeleteCompletely6/v5_PageForDeleteCompletely7/v5_PageForDeleteCompletely8' });
      expectAllToBeTruthy([parentPage, childPage, grandchildPage]);

      await deleteCompletely(childPage, dummyUser1, {}, false);
      const parentPageAfterDelete = await Page.findOne({ path: parentPage.path });
      const childPageAfterDelete = await Page.findOne({ path: childPage.path });
      const grandchildPageAfterDelete = await Page.findOne({ path: grandchildPage.path });
      const childOfDeletedPage = await Page.findOne({ parent: childPageAfterDelete._id });

      expectAllToBeTruthy([parentPageAfterDelete, childPageAfterDelete, grandchildPageAfterDelete]);
      expect(childPageAfterDelete._id).not.toStrictEqual(childPage._id);
      expect(childPageAfterDelete.isEmpty).toBe(true);
      expect(childPageAfterDelete.parent).toStrictEqual(parentPage._id);
      expect(childOfDeletedPage._id).toStrictEqual(grandchildPage._id);

    });
  });

  afterAll(async() => {
    await Page.deleteMany({});
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await Comment.deleteMany({});
    await ShareLink.deleteMany({});
  });
});

describe('PageService page operations with non-public pages', () => {
  // TODO: write test code
});
