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
  let dummyUser1Page;

  // parents
  let parentForRename1;
  let parentForRename2;
  let parentForRename3;
  let parentForRename4;
  let parentForRename5;
  let parentForRename6;
  let parentForRename7;
  let parentForRename8;
  // children
  let childForRename1;
  let childForRename2;
  let childForRename3;
  let childForRename4;
  let childForRename5;
  let childForRename6;
  let childForRename7;

  /**
   * Delete
   */
  let v5PageForDelete1;
  let v5PageForDelete2;
  let v5PageForDelete3;
  let v5PageForDelete4;
  let v5PageForDelete5;
  let v5PageForDelete6;

  let tagForDelete1;
  let tagForDelete2;

  /**
   * Delete completely
   */
  let v5PageForDeleteCompletely1;
  let v5PageForDeleteCompletely2;
  let v5PageForDeleteCompletely3;
  let v5PageForDeleteCompletely4;
  let v5PageForDeleteCompletely5;

  let tagForDeleteCompletely1;
  let tagForDeleteCompletely2;

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
    dummyUser1Page = await Page.create('/user/dummyUser1', 'dummyUser1_page', dummyUser1._id, {});
    await Page.create('/user/dummyUser2', 'dummyUser2_page', dummyUser2._id, {});

    // Create Pages
    await Page.insertMany([
      // parents
      {
        path: '/v5_ParentForRename1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ParentForRename2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        path: '/v5_ParentForRename3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ParentForRename4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ParentForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ParentForRename6',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ParentForRename7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ParentForRename8',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ParentForRename9',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      // children
      {
        path: '/v5_ChildForRename1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ChildForRename2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ChildForRename3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        updatedAt: new Date('2021'),
      },
      {
        path: '/v5_ChildForRename4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ChildForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ChildForRename6',
        grant: Page.GRANT_RESTRICTED,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/v5_ChildForRename7',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
    ]);

    // Find pages as Parent
    parentForRename1 = await Page.findOne({ path: '/v5_ParentForRename1' });
    parentForRename2 = await Page.findOne({ path: '/v5_ParentForRename2' });
    parentForRename3 = await Page.findOne({ path: '/v5_ParentForRename3' });
    parentForRename4 = await Page.findOne({ path: '/v5_ParentForRename4' });
    parentForRename5 = await Page.findOne({ path: '/v5_ParentForRename5' });
    parentForRename6 = await Page.findOne({ path: '/v5_ParentForRename6' });
    parentForRename7 = await Page.findOne({ path: '/v5_ParentForRename7' });
    parentForRename8 = await Page.findOne({ path: '/v5_ParentForRename8' });
    // Find pages as Child
    childForRename1 = await Page.findOne({ path: '/v5_ChildForRename1' });
    childForRename2 = await Page.findOne({ path: '/v5_ChildForRename2' });
    childForRename3 = await Page.findOne({ path: '/v5_ChildForRename3' });
    childForRename4 = await Page.findOne({ path: '/v5_ChildForRename4' });
    childForRename5 = await Page.findOne({ path: '/v5_ChildForRename5' });
    childForRename6 = await Page.findOne({ path: '/v5_ChildForRename6' });
    childForRename7 = await Page.findOne({ path: '/v5_ChildForRename7' });

    // create grandchild
    await Page.insertMany([
      // Grandchild
      {
        path: '/v5_ChildForRename5/v5_GrandchildForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: childForRename5._id,
        updatedAt: new Date('2021'),
      },
      {
        path: '/v5_ChildForRename7/v5_GrandchildForRename7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: childForRename7._id,
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


    v5PageForDelete1 = await Page.findOne({ path: '/trash/v5_PageForDelete1' });
    v5PageForDelete2 = await Page.findOne({ path: '/v5_PageForDelete2' });
    v5PageForDelete3 = await Page.findOne({ path: '/v5_PageForDelete3' });
    v5PageForDelete4 = await Page.findOne({ path: '/v5_PageForDelete3/v5_PageForDelete4' });
    v5PageForDelete5 = await Page.findOne({ path: '/v5_PageForDelete3/v5_PageForDelete4/v5_PageForDelete5' });
    v5PageForDelete6 = await Page.findOne({ path: '/v5_PageForDelete6' });

    await Tag.insertMany([
      { name: 'TagForDelete1' },
      { name: 'TagForDelete2' },
    ]);

    tagForDelete1 = await Tag.findOne({ name: 'TagForDelete1' });
    tagForDelete2 = await Tag.findOne({ name: 'TagForDelete2' });

    await PageTagRelation.insertMany([
      { relatedPage: v5PageForDelete6._id, relatedTag: tagForDelete1 },
      { relatedPage: v5PageForDelete6._id, relatedTag: tagForDelete2 },
    ]);

    /**
     * Delete completely
     */
    const pageIdForDeleteCompletely1 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely2 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely3 = new mongoose.Types.ObjectId();
    const pageIdForDeleteCompletely4 = new mongoose.Types.ObjectId();

    const revisionIdForDeleteCompletely1 = new mongoose.Types.ObjectId();
    const revisionIdForDeleteCompletely2 = new mongoose.Types.ObjectId();
    const revisionIdForDeleteCompletely3 = new mongoose.Types.ObjectId();
    const revisionIdForDeleteCompletely4 = new mongoose.Types.ObjectId();


    await Page.insertMany([
      {
        path: '/v5_PageForDeleteCompletely1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDeleteCompletely1,
        path: '/v5_PageForDeleteCompletely2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDeleteCompletely2,
        path: '/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3',
        grant: Page.GRANT_PUBLIC,
        parent: pageIdForDeleteCompletely1,
        status: Page.STATUS_PUBLISHED,
        isEmpty: true,
      },
      {
        _id: pageIdForDeleteCompletely3,
        path: '/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3/v5_PageForDeleteCompletely4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDeleteCompletely2,
        status: Page.STATUS_PUBLISHED,
      },
      {
        _id: pageIdForDeleteCompletely4,
        path: '/trash/v5_PageForDeleteCompletely5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
      },
    ]);

    v5PageForDeleteCompletely1 = await Page.findOne({ path: '/v5_PageForDeleteCompletely1' });
    v5PageForDeleteCompletely2 = await Page.findOne({ path: '/v5_PageForDeleteCompletely2' });
    v5PageForDeleteCompletely3 = await Page.findOne({ path: '/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3' });
    v5PageForDeleteCompletely4 = await Page.findOne({ path: '/v5_PageForDeleteCompletely2/v5_PageForDeleteCompletely3/v5_PageForDeleteCompletely4' });
    v5PageForDeleteCompletely5 = await Page.findOne({ path: '/trash/v5_PageForDeleteCompletely5' });

    await Revision.insertMany([
      {
        _id: revisionIdForDeleteCompletely1,
        format: 'markdown',
        pageId: pageIdForDeleteCompletely1,
        body: 'pageIdForDeleteCompletely1',
      },
      {
        _id: revisionIdForDeleteCompletely2,
        format: 'markdown',
        pageId: pageIdForDeleteCompletely3,
        body: 'pageIdForDeleteCompletely3',
      },
      {
        _id: revisionIdForDeleteCompletely3,
        format: 'markdown',
        pageId: pageIdForDeleteCompletely4,
        body: 'pageIdForDeleteCompletely4',
      },
      {
        _id: revisionIdForDeleteCompletely4,
        format: 'markdown',
        pageId: pageIdForDeleteCompletely1,
        body: 'comment_pageIdForDeleteCompletely2',
      },
    ]);

    await Tag.insertMany([
      { name: 'TagForDeleteCompletely1' },
      { name: 'TagForDeleteCompletely2' },
    ]);

    tagForDeleteCompletely1 = await Tag.findOne({ name: 'TagForDeleteCompletely1' });
    tagForDeleteCompletely2 = await Tag.findOne({ name: 'TagForDeleteCompletely2' });

    await PageTagRelation.insertMany([
      { relatedPage: v5PageForDeleteCompletely2._id, relatedTag: tagForDeleteCompletely1 },
      { relatedPage: v5PageForDeleteCompletely4._id, relatedTag: tagForDeleteCompletely2 },
    ]);

    await Bookmark.insertMany([
      {
        page: v5PageForDeleteCompletely2._id,
        user: dummyUser1._id,
      },
    ]);

    await Comment.insertMany([
      {
        commentPosition: -1,
        isMarkdown: true,
        page: v5PageForDeleteCompletely2._id,
        creator: dummyUser1._id,
        revision: revisionIdForDeleteCompletely4,
        comment: 'comment_ForDeleteCompletely4',
      },
    ]);

    await PageRedirect.insertMany([
      {
        fromPath: `/from${v5PageForDeleteCompletely2.path}`,
        toPath: v5PageForDeleteCompletely2.path,
      },
      {
        fromPath: `/from${v5PageForDeleteCompletely4.path}`,
        toPath: v5PageForDeleteCompletely4.path,
      },
    ]);

    await ShareLink.insertMany([
      {
        relatedPage: v5PageForDeleteCompletely2._id,
        expiredAt: null,
        description: 'sharlink_v5PageForDeleteCompletely2',
      },
      {
        relatedPage: v5PageForDeleteCompletely4._id,
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
      // rename target page
      const newPath = '/v5_ParentForRename1/renamedChildForRename1';
      const renamedPage = await renamePage(childForRename1, newPath, dummyUser1, {});

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentForRename1._id);

    });

    test('Should rename/move to under empty page', async() => {
      // rename target page
      const newPath = '/v5_ParentForRename2/renamedChildForRename2';
      const renamedPage = await renamePage(childForRename2, newPath, dummyUser1, {});

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(parentForRename2.isEmpty).toBe(true);
      expect(renamedPage.parent).toStrictEqual(parentForRename2._id);
    });

    test('Should rename/move with option updateMetadata: true', async() => {
      // rename target page
      const newPath = '/v5_ParentForRename3/renamedChildForRename3';
      const oldUdpateAt = childForRename3.updatedAt;
      const renamedPage = await renamePage(childForRename3, newPath, dummyUser2, { updateMetadata: true });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentForRename3._id);
      expect(renamedPage.lastUpdateUser).toStrictEqual(dummyUser2._id);
      expect(renamedPage.updatedAt.getFullYear()).toBeGreaterThan(oldUdpateAt.getFullYear());
    });

    // ****************** TODO ******************
    // uncomment the next test when working on 88097
    // ******************************************
    // test('Should move with option createRedirectPage: true', async() => {
    //   // rename target page
    //   const newPath = '/v5_ParentForRename4/renamedChildForRename4';
    //   const renamedPage = await renamePage(childForRename4, newPath, dummyUser2, { createRedirectPage: true });
    //   const pageRedirect = await PageRedirect.find({ fromPath: childForRename4.path, toPath: renamedPage.path });

    // expect(xssSpy).toHaveBeenCalled();
    //   expect(renamedPage.path).toBe(newPath);
    //   expect(renamedPage.parent).toStrictEqual(parentForRename4._id);
    //   expect(pageRedirect.length).toBeGreaterThan(0);
    // });

    test('Should rename/move with descendants', async() => {
      // rename target page
      const newPath = '/v5_ParentForRename5/renamedChildForRename5';
      const renamedPage = await renamePage(childForRename5, newPath, dummyUser1, {});
      // find child of renamed page
      const grandchildren = await Page.find({ parent: renamedPage._id });
      const grandchild = grandchildren[0];

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentForRename5._id);
      // grandchild's parent should be renamed page
      expect(grandchild.parent).toStrictEqual(renamedPage._id);
      expect(grandchild.path).toBe('/v5_ParentForRename5/renamedChildForRename5/v5_GrandchildForRename5');
    });

    test('Should rename/move with same grant', async() => {
      // rename target page
      const newPath = '/v5_ParentForRename6/renamedChildForRename6';
      expect(childForRename6.grant).toBe(Page.GRANT_RESTRICTED);
      const renamedPage = await renamePage(childForRename6, newPath, dummyUser1, {});

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentForRename6._id);
      expect(renamedPage.grant).toBe(Page.GRANT_RESTRICTED);
    });

    test('Should rename/move empty page', async() => {
      // rename target page
      const newPath = '/v5_ParentForRename7/renamedChildForRename7';
      const renamedPage = await renamePage(childForRename7, newPath, dummyUser1, {});
      // find child of renamed page
      const grandchild = await Page.findOne({ parent: renamedPage._id });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.isEmpty).toBe(true);
      expect(renamedPage.parent).toStrictEqual(parentForRename7._id);
      // grandchild's parent should be renamed page
      expect(grandchild.parent).toStrictEqual(renamedPage._id);
      expect(grandchild.path).toBe('/v5_ParentForRename7/renamedChildForRename7/v5_GrandchildForRename7');
    });
    test('Should NOT rename/move with existing path', async() => {
      // rename target page
      const newPath = '/v5_ParentForRename9';
      let isThrown;
      try {
        await renamePage(parentForRename8, newPath, dummyUser1, {});
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
      try {
        await deletePage(rootPage, dummyUser1, {}, false);
      }
      catch (err) {
        isThrown = true;
      }
      expect(isThrown).toBe(true);
    });
    test('Should NOT delete trashed page', async() => {
      let isThrown;
      try {
        await deletePage(v5PageForDelete1, dummyUser1, {}, false);
      }
      catch (err) {
        isThrown = true;
      }
      expect(isThrown).toBe(true);
    });
    test('Should NOT delete /user/hoge page', async() => {
      let isThrown;
      try {
        await deletePage(dummyUser1Page, dummyUser1, {}, false);
      }
      catch (err) {
        isThrown = true;
      }
      expect(isThrown).toBe(true);
    });
    test('Should delete single page', async() => {
      const oldPath = v5PageForDelete2.path;
      const deletedPage = await deletePage(v5PageForDelete2, dummyUser1, {}, false);

      expect(deletedPage.path).toBe(`/trash${oldPath}`);
      expect(deletedPage.parent).toBeNull();
      expect(deletedPage.status).toBe(Page.STATUS_DELETED);
    });
    test('Should delete multiple pages including empty child', async() => {
      const deletedPage = await deletePage(v5PageForDelete3, dummyUser1, {}, true);
      const deletedV5PageForDelete4 = await Page.findOne({ path: `/trash${v5PageForDelete4.path}` });
      const deletedV5PageForDelete5 = await Page.findOne({ path: `/trash${v5PageForDelete5.path}` });

      // originally NOT empty page should exist with status 'deleted' and parent set null
      expect(deletedPage._id).toStrictEqual(v5PageForDelete3._id);
      expect(deletedPage.status).toBe(Page.STATUS_DELETED);
      expect(deletedPage.parent).toBeNull();
      // originally empty page should NOT exist
      expect(deletedV5PageForDelete4).toBeNull();
      // originally NOT empty page should exist with status 'deleted' and parent set null
      expect(deletedV5PageForDelete5._id).toStrictEqual(v5PageForDelete5._id);
      expect(deletedV5PageForDelete5.status).toBe(Page.STATUS_DELETED);
      expect(deletedV5PageForDelete5.parent).toBeNull();
    });
    test('Should delete page tags', async() => {
      const deletedPage = await deletePage(v5PageForDelete6, dummyUser1, {}, false);
      const deletedTag1 = await PageTagRelation.findOne({ relatedpage: deletedPage._id, relatedTag: tagForDelete1 });
      const deletedTag2 = await PageTagRelation.findOne({ relatedpage: deletedPage._id, relatedTag: tagForDelete2 });

      expect(deletedPage.status).toBe(Page.STATUS_DELETED);
      expect(deletedTag1.isPageTrashed).toBe(true);
      expect(deletedTag2.isPageTrashed).toBe(true);
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
      await deleteCompletely(v5PageForDeleteCompletely1, dummyUser1, {}, false);
      const deletedPage = await Page.findOne({ _id: v5PageForDeleteCompletely1._id });

      expect(deletedPage).toBeNull();
    });
    test('Should completely delete multiple pages', async() => {
      await deleteCompletely(v5PageForDeleteCompletely2, dummyUser1, {}, true);
      const deletedPages = await Page.find({ _id: { $in: [v5PageForDeleteCompletely2._id, v5PageForDeleteCompletely3._id, v5PageForDeleteCompletely4._id] } });
      const deletedRevisions = await Revision.find({ pageId: { $in: [v5PageForDeleteCompletely2._id, v5PageForDeleteCompletely4._id] } });
      const tags = await Tag.find({ name: { $in: [tagForDeleteCompletely1.name, tagForDeleteCompletely2.name] } });
      const deletedPageTagRelations = await PageTagRelation.find({ relatedPage: { $in: [v5PageForDeleteCompletely2._id, v5PageForDeleteCompletely4._id] } });
      const deletedBookmarks = await Bookmark.find({ page: v5PageForDeleteCompletely2._id });
      const deletedComments = await Comment.find({ page: v5PageForDeleteCompletely2._id });
      const deletedPageRedirects = await PageRedirect.find({ toPath: { $in: [v5PageForDeleteCompletely2.toPath, v5PageForDeleteCompletely4.path] } });
      const deletedShareLinks = await ShareLink.find({ pageId: { $in: [v5PageForDeleteCompletely2._id, v5PageForDeleteCompletely4._id] } });

      // page should be null
      deletedPages.forEach((deletedPage) => {
        expect(deletedPage).toBeNull();
      });
      // revision should be null
      deletedRevisions.forEach((revision) => {
        expect(revision).toBeNull();
      });
      // tag should exist
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
      await deleteCompletely(v5PageForDeleteCompletely5, dummyUser1, {}, false);
      const deltedPage = await Page.findOne({ _id: v5PageForDeleteCompletely5._id });
      const deltedRevision = await Revision.findOne({ pageId: v5PageForDeleteCompletely5._id });

      expect(deltedPage).toBeNull();
      expect(deltedRevision).toBeNull();
    });
  });

  afterAll(async() => {
    await Page.deleteMany({});
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await Comment.deleteMany({});
    await PageRedirect.deleteMany({});
    await ShareLink.deleteMany({});
  });
});

describe('PageService page operations with non-public pages', () => {
  // TODO: write test code
});
