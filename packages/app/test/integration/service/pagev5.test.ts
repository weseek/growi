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

  // duplicate
  // parents
  let v5PageForDuplicate1;
  let v5PageForDuplicate2;
  let v5PageForDuplicate3;
  let v5PageForDuplicate4;
  let v5PageForDuplicate5;
  let v5PageForDuplicate6;
  let v5PageForDuplicate7;

  let tag1;
  let tag2;

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

    // delete root page if any created by other test file
    const pages = await Page.find({ path: '/' });
    if (pages.length > 0) {
      await Page.deleteOne({ path: '/' });
    }
    // then create new root page
    rootPage = await Page.create('/', 'body', dummyUser1._id, {});

    /*
     * Rename
     */
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

    /*
     * Duplicate
     */
    // page ids
    const duplicatePageId1 = new mongoose.Types.ObjectId();
    const duplicatePageId2 = new mongoose.Types.ObjectId();
    const duplicatePageId3 = new mongoose.Types.ObjectId();
    const duplicatePageId4 = new mongoose.Types.ObjectId();
    const duplicatePageId5 = new mongoose.Types.ObjectId();
    const duplicatePageId6 = new mongoose.Types.ObjectId();
    const duplicatePageId7 = new mongoose.Types.ObjectId();
    const duplicatePageId8 = new mongoose.Types.ObjectId();
    const duplicatePageId9 = new mongoose.Types.ObjectId();
    const duplicatePageId10 = new mongoose.Types.ObjectId();
    const duplicatePageId11 = new mongoose.Types.ObjectId();
    const duplicatePageId12 = new mongoose.Types.ObjectId();
    const duplicatePageId13 = new mongoose.Types.ObjectId();
    const duplicatePageId14 = new mongoose.Types.ObjectId();
    const duplicatePageId15 = new mongoose.Types.ObjectId();

    // revision ids
    const revisionId1 = new mongoose.Types.ObjectId();
    const revisionId2 = new mongoose.Types.ObjectId();
    const revisionId3 = new mongoose.Types.ObjectId();
    const revisionId4 = new mongoose.Types.ObjectId();
    const revisionId5 = new mongoose.Types.ObjectId();
    const revisionId6 = new mongoose.Types.ObjectId();
    const revisionId7 = new mongoose.Types.ObjectId();
    const revisionId8 = new mongoose.Types.ObjectId();
    const revisionId9 = new mongoose.Types.ObjectId();
    const revisionId10 = new mongoose.Types.ObjectId();
    const revisionId11 = new mongoose.Types.ObjectId();
    const revisionId12 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        _id: duplicatePageId1,
        path: '/v5_PageForDuplicate1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionId1,
      },
      {
        _id: duplicatePageId2,
        path: '/v5_PageForDuplicate2',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        _id: duplicatePageId3,
        path: '/v5_PageForDuplicate2/v5_ChildForDuplicate2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: duplicatePageId2,
        revision: revisionId2,
      },
      {
        _id: duplicatePageId4,
        path: '/v5_PageForDuplicate3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionId3,
      },
      {
        _id: duplicatePageId5,
        path: '/v5_PageForDuplicate3/v5_Child_1_ForDuplicate3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: duplicatePageId4,
        revision: revisionId4,
      },
      {
        _id: duplicatePageId6,
        path: '/v5_PageForDuplicate3/v5_Child_2_ForDuplicate3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: duplicatePageId4,
        revision: revisionId5,
      },
      {
        _id: duplicatePageId7,
        path: '/v5_PageForDuplicate4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionId6,
      },
      {
        _id: duplicatePageId8,
        path: '/v5_PageForDuplicate4/v5_empty_PageForDuplicate4',
        grant: Page.GRANT_PUBLIC,
        parent: duplicatePageId7,
        isEmpty: true,
      },
      {
        _id: duplicatePageId9,
        path: '/v5_PageForDuplicate4/v5_empty_PageForDuplicate4/v5_grandchild_PageForDuplicate4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: duplicatePageId8,
        revision: revisionId7,
      },
      {
        _id: duplicatePageId10,
        path: '/v5_PageForDuplicate5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionId8,
      },
      {
        _id: duplicatePageId11,
        path: '/v5_PageForDuplicate6',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionId9,
      },
      {
        _id: duplicatePageId13,
        path: '/v5_empty_PageForDuplicate7',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        _id: duplicatePageId14,
        path: '/v5_empty_PageForDuplicate7/v5_child_PageForDuplicate7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: duplicatePageId13,
        revision: revisionId11,
      },
      {
        _id: duplicatePageId15,
        path: '/v5_empty_PageForDuplicate7/v5_child_PageForDuplicate7/v5_grandchild_PageForDuplicate7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: duplicatePageId14,
        revision: revisionId12,
      },
    ]);

    // Revision
    await Revision.insertMany([
      {
        _id: revisionId1,
        body: 'body1',
        format: 'markdown',
        pageId: duplicatePageId1,
        author: dummyUser1,
      },
      {
        _id: revisionId2,
        body: 'body3',
        format: 'markdown',
        pageId: duplicatePageId3,
        author: dummyUser1,
      },
      {
        _id: revisionId3,
        body: 'parent_page_body4',
        format: 'markdown',
        pageId: duplicatePageId4,
        author: dummyUser1,
      },
      {
        _id: revisionId4,
        body: 'revision_id_4_child_page_body',
        format: 'markdown',
        pageId: duplicatePageId5,
        author: dummyUser1,
      },
      {
        _id: revisionId5,
        body: 'revision_id_5_child_page_body',
        format: 'markdown',
        pageId: duplicatePageId6,
        author: dummyUser1,
      },
      {
        _id: revisionId6,
        body: '/v5_PageForDuplicate4',
        format: 'markdown',
        pageId: duplicatePageId7,
        author: dummyUser1,
      },
      {
        _id: revisionId7,
        body: '/v5_PageForDuplicate4/v5_empty_PageForDuplicate4/v5_grandchild_PageForDuplicate4',
        format: 'markdown',
        pageId: duplicatePageId9,
        author: dummyUser1,
      },
      {
        _id: revisionId8,
        body: '/v5_PageForDuplicate5',
        format: 'markdown',
        pageId: duplicatePageId10,
        author: dummyUser1,
      },
      {
        _id: revisionId9,
        body: '/v5_PageForDuplicate6',
        format: 'markdown',
        pageId: duplicatePageId11,
        author: dummyUser1,
      },
      {
        _id: revisionId10,
        body: '/v5_PageForDuplicate6',
        format: 'comment',
        pageId: duplicatePageId12,
        author: dummyUser1,
      },
      {
        _id: revisionId11,
        body: '/v5_child_PageForDuplicate7',
        format: 'markdown',
        pageId: duplicatePageId14,
        author: dummyUser1,
      },
      {
        _id: revisionId12,
        body: '/v5_grandchild_PageForDuplicate7',
        format: 'markdown',
        pageId: duplicatePageId15,
        author: dummyUser1,
      },
    ]);
    v5PageForDuplicate1 = await Page.findOne({ path: '/v5_PageForDuplicate1' });
    v5PageForDuplicate2 = await Page.findOne({ path: '/v5_PageForDuplicate2' });
    v5PageForDuplicate3 = await Page.findOne({ path: '/v5_PageForDuplicate3' });
    v5PageForDuplicate4 = await Page.findOne({ path: '/v5_PageForDuplicate4' });
    v5PageForDuplicate5 = await Page.findOne({ path: '/v5_PageForDuplicate5' });
    v5PageForDuplicate6 = await Page.findOne({ path: '/v5_PageForDuplicate6' });
    v5PageForDuplicate7 = await Page.findOne({ path: '/v5_empty_PageForDuplicate7' });

    await Tag.insertMany([
      { name: 'Tag1' },
      { name: 'Tag2' },
    ]);

    tag1 = await Tag.findOne({ name: 'Tag1' });
    tag2 = await Tag.findOne({ name: 'Tag2' });

    await PageTagRelation.insertMany([
      { relatedPage: v5PageForDuplicate5._id, relatedTag: tag1 },
      { relatedPage: v5PageForDuplicate5._id, relatedTag: tag2 },
    ]);

    await Comment.insertMany([
      {
        commentPosition: -1,
        isMarkdown: true,
        page: v5PageForDuplicate6._id,
        creator: dummyUser1._id,
        revision: revisionId10,
        comment: 'this is comment',
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

  describe('Duplicate', () => {

    const duplicate = async(page, newPagePath, user, isRecursively) => {
      // mock return value
      const mockedResumableDuplicateDescendants = jest.spyOn(crowi.pageService, 'resumableDuplicateDescendants').mockReturnValue(null);
      const mockedCreateAndSendNotifications = jest.spyOn(crowi.pageService, 'createAndSendNotifications').mockReturnValue(null);
      const duplicatedPage = await crowi.pageService.duplicate(page, newPagePath, user, isRecursively);

      // retrieve the arguments passed when calling method resumableDuplicateDescendants inside duplicate method
      const argsForResumableDuplicateDescendants = mockedResumableDuplicateDescendants.mock.calls[0];

      // restores the original implementation
      mockedResumableDuplicateDescendants.mockRestore();
      mockedCreateAndSendNotifications.mockRestore();

      // duplicate descendants
      if (isRecursively) {
        await crowi.pageService.resumableDuplicateDescendants(...argsForResumableDuplicateDescendants);
      }

      return duplicatedPage;
    };

    test('Should duplicate single page', async() => {
      const newPagePath = '/duplicatedv5PageForDuplicate1';
      const duplicatedPage = await duplicate(v5PageForDuplicate1, newPagePath, dummyUser1, false);
      const duplicatedRevision = await Revision.findOne({ pageId: duplicatedPage._id });
      const baseRevision = await Revision.findOne({ pageId: v5PageForDuplicate1._id });

      // new path
      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedPage._id).not.toStrictEqual(v5PageForDuplicate1._id);
      expect(duplicatedPage.revision).toStrictEqual(duplicatedRevision._id);
      expect(duplicatedRevision.body).toEqual(baseRevision.body);
    });
    test('Should NOT duplicate single empty page', async() => {
      const newPagePath = '/duplicatedv5PageForDuplicate2';
      let isThrown;
      let duplicatedPage;
      try {
        duplicatedPage = await duplicate(v5PageForDuplicate2, newPagePath, dummyUser1, false);
      }
      catch (err) {
        isThrown = true;
      }

      expect(duplicatedPage).toBeFalsy();
      expect(isThrown).toBe(true);
    });
    test('Should duplicate multiple pages', async() => {
      const newPagePath = '/duplicatedv5PageForDuplicate3';
      const duplicatedPage = await duplicate(v5PageForDuplicate3, newPagePath, dummyUser1, true);
      const childrenForBasePage = await Page.find({ parent: v5PageForDuplicate3._id }).populate({ path: 'revision', model: 'Revision' });
      const childrenForDuplicatedPage = await Page.find({ parent: duplicatedPage._id }).populate({ path: 'revision', model: 'Revision' });

      const revisionBodyOfChildrenForBasePage = childrenForBasePage.map(p => p.revision.body);
      const revisionBodyOfChildrenForDuplicatedPage = childrenForDuplicatedPage.map(p => p.revision.body);

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(childrenForDuplicatedPage.length).toBe(childrenForBasePage.length);
      expect(revisionBodyOfChildrenForDuplicatedPage).toEqual(expect.arrayContaining(revisionBodyOfChildrenForBasePage));
    });
    test('Should duplicate multiple pages with empty child in it', async() => {
      const newPagePath = '/duplicatedv5PageForDuplicate4';
      const duplicatedPage = await duplicate(v5PageForDuplicate4, newPagePath, dummyUser1, true);
      const duplicatedChild = await Page.findOne({ parent: duplicatedPage._id });
      const duplicatedGrandchild = await Page.find({ parent: duplicatedChild._id });

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedChild.isEmpty).toBe(true);
      expect(duplicatedGrandchild.length).toBeGreaterThan(0);
    });
    test('Should duplicate tags', async() => {
      const newPagePath = '/duplicatedv5PageForDuplicate5';
      const duplicatedPage = await duplicate(v5PageForDuplicate5, newPagePath, dummyUser1, false);
      const duplicatedTagRelations = await PageTagRelation.find({ relatedPage: duplicatedPage._id });

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedTagRelations.length).toBeGreaterThanOrEqual(2);
    });
    test('Should NOT duplicate comments', async() => {
      const newPagePath = '/duplicatedv5PageForDuplicate6';
      const duplicatedPage = await duplicate(v5PageForDuplicate6, newPagePath, dummyUser1, false);
      const comments = await Comment.find({ page: v5PageForDuplicate6._id });
      const duplicatedComments = await Comment.find({ page: duplicatedPage._id });

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(comments.length).toBe(1);
      expect(duplicatedComments.length).toBe(0);
    });

    test('Should duplicate empty page with descendants', async() => {
      const newPagePath = '/duplicatedv5EmptyPageForDuplicate7';
      const basePageChild = await Page.findOne({ parent: v5PageForDuplicate7._id }).populate({ path: 'revision', model: 'Revision' });
      const basePageGrandhild = await Page.findOne({ parent: basePageChild._id }).populate({ path: 'revision', model: 'Revision' });
      const duplicatedPage = await duplicate(v5PageForDuplicate7, newPagePath, dummyUser1, true);
      const duplicatedChild = await Page.findOne({ parent: duplicatedPage._id }).populate({ path: 'revision', model: 'Revision' });
      const duplicatedGrandchild = await Page.findOne({ parent: duplicatedChild._id }).populate({ path: 'revision', model: 'Revision' });

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedPage.isEmpty).toBe(true);
      expect(basePageChild.revision.body).toBe(duplicatedChild.revision.body);
      expect(basePageGrandhild.revision.body).toBe(duplicatedGrandchild.revision.body);
    });
  });

  afterAll(async() => {
    await Page.deleteMany({});
    await User.deleteMany({});
    await Revision.deleteMany({});
    await Tag.deleteMany({});
    await PageTagRelation.deleteMany({});
  });
});

describe('PageService page operations with non-public pages', () => {
  // TODO: write test code
});
