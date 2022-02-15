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
      { name: 'v5DummyUser1', username: 'v5DummyUser1', email: 'v5DummyUser1@example.com' },
      { name: 'v5DummyUser2', username: 'v5DummyUser2', email: 'v5DummyUser2@example.com' },
    ]);

    dummyUser1 = await User.findOne({ username: 'v5DummyUser1' });
    if (dummyUser1 == null) {
      await User.create({ name: 'v5DummyUser1', username: 'v5DummyUser1', email: 'v5DummyUser1@example.com' });
    }
    dummyUser2 = await User.findOne({ username: 'v5DummyUser2' });
    if (dummyUser2 == null) {
      await User.create({ name: 'v5DummyUser2', username: 'v5DummyUser2', email: 'v5DummyUser2@example.com' });
    }

    xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);

    rootPage = await Page.findOne({ path: '/' });
    if (rootPage == null) {
      const pages = await Page.insertMany([{ path: '/', grant: Page.GRANT_PUBLIC }]);
      rootPage = pages[0];
    }

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


    const pageIdForRevert1 = new mongoose.Types.ObjectId();
    const pageIdForRevert2 = new mongoose.Types.ObjectId();
    const pageIdForRevert3 = new mongoose.Types.ObjectId();

    const revisionIdForRevert1 = new mongoose.Types.ObjectId();
    const revisionIdForRevert2 = new mongoose.Types.ObjectId();
    const revisionIdForRevert3 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        _id: pageIdForRevert1,
        path: '/trash/v5_revert1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForRevert1,
        status: Page.STATUS_DELETED,
      },
      {
        _id: pageIdForRevert2,
        path: '/trash/v5_revert2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        revision: revisionIdForRevert2,
        status: Page.STATUS_DELETED,
      },
      {
        _id: pageIdForRevert3,
        path: '/trash/v5_revert2/v5_revert3/v5_revert4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        revision: revisionIdForRevert3,
        status: Page.STATUS_DELETED,
      },
    ]);

    await Revision.insertMany([
      {
        _id: revisionIdForRevert1,
        pageId: pageIdForRevert1,
        body: 'revert1',
        format: 'comment',
        author: dummyUser1,
      },
      {
        _id: revisionIdForRevert2,
        pageId: pageIdForRevert2,
        body: 'revert2',
        format: 'comment',
        author: dummyUser1,
      },
      {
        _id: revisionIdForRevert3,
        pageId: pageIdForRevert3,
        body: 'revert3',
        format: 'comment',
        author: dummyUser1,
      },
    ]);

    const tagIdRevert1 = new mongoose.Types.ObjectId();
    await Tag.insertMany([
      { _id: tagIdRevert1, name: 'revertTag1' },
    ]);

    await PageTagRelation.insertMany([
      {
        relatedPage: pageIdForRevert1,
        relatedTag: tagIdRevert1,
        isPageTrashed: true,
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

  describe('revert', () => {
    const revertDeletedPage = async(page, user, options = {}, isRecursively = false) => {
      // mock return value
      const mockedResumableRevertDeletedDescendants = jest.spyOn(crowi.pageService, 'resumableRevertDeletedDescendants').mockReturnValue(null);
      const revertedPage = await crowi.pageService.revertDeletedPage(page, user, options, isRecursively);

      const argsForResumableRevertDeletedDescendants = mockedResumableRevertDeletedDescendants.mock.calls[0];

      // restores the original implementation
      mockedResumableRevertDeletedDescendants.mockRestore();
      if (isRecursively) {
        await crowi.pageService.resumableRevertDeletedDescendants(...argsForResumableRevertDeletedDescendants);
      }

      return revertedPage;

    };

    test('revert single deleted page', async() => {
      const deletedPage = await Page.findOne({ path: '/trash/v5_revert1' });
      const revision = await Revision.findOne({ pageId: deletedPage._id });
      const tag = await Tag.findOne({ name: 'revertTag1' });
      const deletedPageTagRelation = await PageTagRelation.findOne({ relatedPage: deletedPage._id, relatedTag: tag._id });

      expectAllToBeTruthy([deletedPage, revision, tag, deletedPageTagRelation]);
      expect(deletedPage.status).toBe(Page.STATUS_DELETED);
      expect(deletedPageTagRelation.isPageTrashed).toBe(true);

      const revertedPage = await revertDeletedPage(deletedPage, dummyUser1, {}, false);
      const pageTagRelation = await PageTagRelation.findOne({ relatedPage: deletedPage._id, relatedTag: tag._id });

      expect(revertedPage.path).toBe('/v5_revert1');
      expect(revertedPage.status).toBe(Page.STATUS_PUBLISHED);
      expect(pageTagRelation.isPageTrashed).toBe(false);

    });

    test('revert multiple deleted page (has non existent page in the middle)', async() => {
      const deletedPage1 = await Page.findOne({ path: '/trash/v5_revert2' });
      const deletedPage2 = await Page.findOne({ path: '/trash/v5_revert2/v5_revert3/v5_revert4' });
      const revision1 = await Revision.findOne({ pageId: deletedPage1._id });
      const revision2 = await Revision.findOne({ pageId: deletedPage2._id });

      expectAllToBeTruthy([deletedPage1, deletedPage2, revision1, revision2]);
      expect(deletedPage1.status).toBe(Page.STATUS_DELETED);
      expect(deletedPage2.status).toBe(Page.STATUS_DELETED);

      const revertedPage1 = await revertDeletedPage(deletedPage1, dummyUser1, {}, true);
      const revertedPage2 = await Page.findOne({ _id: deletedPage2._id });
      const newlyCreatedPage = await Page.findOne({ path: '/v5_revert2/v5_revert3' });

      expectAllToBeTruthy([revertedPage1, revertedPage2, newlyCreatedPage]);
      expect(revertedPage1.path).toBe('/v5_revert2');
      expect(revertedPage2.path).toBe('/v5_revert2/v5_revert3/v5_revert4');
      expect(newlyCreatedPage.parent).toStrictEqual(revertedPage1._id);
      expect(revertedPage2.parent).toStrictEqual(newlyCreatedPage._id);
      expect(revertedPage1.status).toBe(Page.STATUS_PUBLISHED);
      expect(revertedPage2.status).toBe(Page.STATUS_PUBLISHED);
      expect(newlyCreatedPage.status).toBe(Page.STATUS_PUBLISHED);

    });
  });

});
describe('PageService page operations with non-public pages', () => {
  // TODO: write test code
});
