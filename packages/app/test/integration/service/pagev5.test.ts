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
    const pageIdForDuplicate1 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate2 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate3 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate4 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate5 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate6 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate7 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate8 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate9 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate10 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate11 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate12 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate13 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate14 = new mongoose.Types.ObjectId();
    const pageIdForDuplicate15 = new mongoose.Types.ObjectId();

    // revision ids
    const revisionIdForDuplicate1 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate2 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate3 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate4 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate5 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate6 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate7 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate8 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate9 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate10 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate11 = new mongoose.Types.ObjectId();
    const revisionIdForDuplicate12 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        _id: pageIdForDuplicate1,
        path: '/v5_PageForDuplicate1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForDuplicate1,
      },
      {
        _id: pageIdForDuplicate2,
        path: '/v5_PageForDuplicate2',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        _id: pageIdForDuplicate3,
        path: '/v5_PageForDuplicate2/v5_ChildForDuplicate2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate2,
        revision: revisionIdForDuplicate2,
      },
      {
        _id: pageIdForDuplicate4,
        path: '/v5_PageForDuplicate3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForDuplicate3,
      },
      {
        _id: pageIdForDuplicate5,
        path: '/v5_PageForDuplicate3/v5_Child_1_ForDuplicate3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate4,
        revision: revisionIdForDuplicate4,
      },
      {
        _id: pageIdForDuplicate6,
        path: '/v5_PageForDuplicate3/v5_Child_2_ForDuplicate3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate4,
        revision: revisionIdForDuplicate5,
      },
      {
        _id: pageIdForDuplicate7,
        path: '/v5_PageForDuplicate4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForDuplicate6,
      },
      {
        _id: pageIdForDuplicate8,
        path: '/v5_PageForDuplicate4/v5_empty_PageForDuplicate4',
        grant: Page.GRANT_PUBLIC,
        parent: pageIdForDuplicate7,
        isEmpty: true,
      },
      {
        _id: pageIdForDuplicate9,
        path: '/v5_PageForDuplicate4/v5_empty_PageForDuplicate4/v5_grandchild_PageForDuplicate4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate8,
        revision: revisionIdForDuplicate7,
      },
      {
        _id: pageIdForDuplicate10,
        path: '/v5_PageForDuplicate5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForDuplicate8,
      },
      {
        _id: pageIdForDuplicate11,
        path: '/v5_PageForDuplicate6',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForDuplicate9,
      },
      {
        _id: pageIdForDuplicate13,
        path: '/v5_empty_PageForDuplicate7',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        _id: pageIdForDuplicate14,
        path: '/v5_empty_PageForDuplicate7/v5_child_PageForDuplicate7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate13,
        revision: revisionIdForDuplicate11,
      },
      {
        _id: pageIdForDuplicate15,
        path: '/v5_empty_PageForDuplicate7/v5_child_PageForDuplicate7/v5_grandchild_PageForDuplicate7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate14,
        revision: revisionIdForDuplicate12,
      },
    ]);

    await Revision.insertMany([
      {
        _id: revisionIdForDuplicate1,
        body: 'body1',
        format: 'markdown',
        pageId: pageIdForDuplicate1,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate2,
        body: 'body3',
        format: 'markdown',
        pageId: pageIdForDuplicate3,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate3,
        body: 'parent_page_body4',
        format: 'markdown',
        pageId: pageIdForDuplicate4,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate4,
        body: 'revision_id_4_child_page_body',
        format: 'markdown',
        pageId: pageIdForDuplicate5,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate5,
        body: 'revision_id_5_child_page_body',
        format: 'markdown',
        pageId: pageIdForDuplicate6,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate6,
        body: '/v5_PageForDuplicate4',
        format: 'markdown',
        pageId: pageIdForDuplicate7,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate7,
        body: '/v5_PageForDuplicate4/v5_empty_PageForDuplicate4/v5_grandchild_PageForDuplicate4',
        format: 'markdown',
        pageId: pageIdForDuplicate9,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate8,
        body: '/v5_PageForDuplicate5',
        format: 'markdown',
        pageId: pageIdForDuplicate10,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate9,
        body: '/v5_PageForDuplicate6',
        format: 'markdown',
        pageId: pageIdForDuplicate11,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate10,
        body: '/v5_PageForDuplicate6',
        format: 'comment',
        pageId: pageIdForDuplicate12,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate11,
        body: '/v5_child_PageForDuplicate7',
        format: 'markdown',
        pageId: pageIdForDuplicate14,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate12,
        body: '/v5_grandchild_PageForDuplicate7',
        format: 'markdown',
        pageId: pageIdForDuplicate15,
        author: dummyUser1,
      },
    ]);
    const tagForDuplicate1 = new mongoose.Types.ObjectId();
    const tagForDuplicate2 = new mongoose.Types.ObjectId();

    await Tag.insertMany([
      { _id: tagForDuplicate1, name: 'Tag1' },
      { _id: tagForDuplicate2, name: 'Tag2' },
    ]);

    await PageTagRelation.insertMany([
      { relatedPage: pageIdForDuplicate10, relatedTag: tagForDuplicate1 },
      { relatedPage: pageIdForDuplicate10._id, relatedTag: tagForDuplicate2 },
    ]);

    await Comment.insertMany([
      {
        commentPosition: -1,
        isMarkdown: true,
        page: pageIdForDuplicate11,
        creator: dummyUser1._id,
        revision: revisionIdForDuplicate10,
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
      const v5PageForDuplicate1 = await Page.findOne({ path: '/v5_PageForDuplicate1' });
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
      const v5PageForDuplicate2 = await Page.findOne({ path: '/v5_PageForDuplicate2' });
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
      const v5PageForDuplicate3 = await Page.findOne({ path: '/v5_PageForDuplicate3' });
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
      const v5PageForDuplicate4 = await Page.findOne({ path: '/v5_PageForDuplicate4' });
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
      const v5PageForDuplicate5 = await Page.findOne({ path: '/v5_PageForDuplicate5' });
      const newPagePath = '/duplicatedv5PageForDuplicate5';
      const duplicatedPage = await duplicate(v5PageForDuplicate5, newPagePath, dummyUser1, false);
      const duplicatedTagRelations = await PageTagRelation.find({ relatedPage: duplicatedPage._id });

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedTagRelations.length).toBeGreaterThanOrEqual(2);
    });
    test('Should NOT duplicate comments', async() => {
      const v5PageForDuplicate6 = await Page.findOne({ path: '/v5_PageForDuplicate6' });
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
      const v5PageForDuplicate7 = await Page.findOne({ path: '/v5_empty_PageForDuplicate7' });
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
