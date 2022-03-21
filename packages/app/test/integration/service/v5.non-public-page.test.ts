/* eslint-disable no-unused-vars */
import { advanceTo } from 'jest-date-mock';

import mongoose from 'mongoose';

import { getInstance } from '../setup-crowi';

describe('PageService page operations with non-public pages', () => {

  let dummyUser1;
  let dummyUser2;
  let npDummyUser1;
  let npDummyUser2;
  let npDummyUser3;
  let groupIdA;
  let groupIdB;
  let groupIdC;
  let crowi;
  let Page;
  let Revision;
  let User;
  let UserGroup;
  let UserGroupRelation;
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
    dataList.forEach((data, i) => {
      if (data == null) { console.log(`index: ${i}`) }
      expect(data).toBeTruthy();
    });
  };

  /**
   * Revert
   */
  // page id
  const pageIdRevert1 = new mongoose.Types.ObjectId();
  const pageIdRevert2 = new mongoose.Types.ObjectId();
  const pageIdRevert3 = new mongoose.Types.ObjectId();
  const pageIdRevert4 = new mongoose.Types.ObjectId();
  const pageIdRevert5 = new mongoose.Types.ObjectId();
  const pageIdRevert6 = new mongoose.Types.ObjectId();
  // revision id
  const revisionIdRevert1 = new mongoose.Types.ObjectId();
  const revisionIdRevert2 = new mongoose.Types.ObjectId();
  const revisionIdRevert3 = new mongoose.Types.ObjectId();
  const revisionIdRevert4 = new mongoose.Types.ObjectId();
  const revisionIdRevert5 = new mongoose.Types.ObjectId();
  const revisionIdRevert6 = new mongoose.Types.ObjectId();
  // tag id
  const tagIdRevert1 = new mongoose.Types.ObjectId();
  const tagIdRevert2 = new mongoose.Types.ObjectId();

  beforeAll(async() => {
    crowi = await getInstance();
    await crowi.configManager.updateConfigsInTheSameNamespace('crowi', { 'app:isV5Compatible': true });

    User = mongoose.model('User');
    UserGroup = mongoose.model('UserGroup');
    UserGroupRelation = mongoose.model('UserGroupRelation');
    Page = mongoose.model('Page');
    Revision = mongoose.model('Revision');
    Tag = mongoose.model('Tag');
    PageTagRelation = mongoose.model('PageTagRelation');
    Bookmark = mongoose.model('Bookmark');
    Comment = mongoose.model('Comment');
    ShareLink = mongoose.model('ShareLink');
    PageRedirect = mongoose.model('PageRedirect');
    UserGroup = mongoose.model('UserGroup');
    UserGroupRelation = mongoose.model('UserGroupRelation');

    /*
     * Common
     */

    const npUserId1 = new mongoose.Types.ObjectId();
    const npUserId2 = new mongoose.Types.ObjectId();
    const npUserId3 = new mongoose.Types.ObjectId();
    await User.insertMany([
      {
        _id: npUserId1, name: 'npUser1', username: 'npUser1', email: 'npUser1@example.com',
      },
      {
        _id: npUserId2, name: 'npUser2', username: 'npUser2', email: 'npUser2@example.com',
      },
      {
        _id: npUserId3, name: 'npUser3', username: 'npUser3', email: 'npUser3@example.com',
      },
    ]);

    const groupIdIsolate = new mongoose.Types.ObjectId();
    groupIdA = new mongoose.Types.ObjectId();
    groupIdB = new mongoose.Types.ObjectId();
    groupIdC = new mongoose.Types.ObjectId();
    await UserGroup.insertMany([
      {
        _id: groupIdIsolate,
        name: 'np_groupIsolate',
      },
      {
        _id: groupIdA,
        name: 'np_groupA',
      },
      {
        _id: groupIdB,
        name: 'np_groupB',
        parent: groupIdA,
      },
      {
        _id: groupIdC,
        name: 'np_groupC',
        parent: groupIdB,
      },
    ]);

    await UserGroupRelation.insertMany([
      {
        relatedGroup: groupIdIsolate,
        relatedUser: npUserId1,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdIsolate,
        relatedUser: npUserId2,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdA,
        relatedUser: npUserId1,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdA,
        relatedUser: npUserId2,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdA,
        relatedUser: npUserId3,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdB,
        relatedUser: npUserId2,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdB,
        relatedUser: npUserId3,
        createdAt: new Date(),
      },
      {
        relatedGroup: groupIdC,
        relatedUser: npUserId3,
        createdAt: new Date(),
      },
    ]);

    xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);

    dummyUser1 = await User.findOne({ username: 'v5DummyUser1' });
    dummyUser2 = await User.findOne({ username: 'v5DummyUser2' });
    npDummyUser1 = await User.findOne({ username: 'npUser1' });
    npDummyUser2 = await User.findOne({ username: 'npUser2' });
    npDummyUser3 = await User.findOne({ username: 'npUser3' });

    rootPage = await Page.findOne({ path: '/' });
    if (rootPage == null) {
      const pages = await Page.insertMany([{ path: '/', grant: Page.GRANT_PUBLIC }]);
      rootPage = pages[0];
    }

    /*
     * Rename
     */

    /*
     * Duplicate
     */

    /**
     * Delete
     */

    /**
     * Delete completely
     */
    const pageIdDeleteComp1 = new mongoose.Types.ObjectId();
    const pageIdDeleteComp2 = new mongoose.Types.ObjectId();
    await Page.insertMany([
      {
        path: '/npdc1_awl',
        grant: Page.GRANT_RESTRICTED,
        status: Page.STATUS_PUBLISHED,
        isEmpty: false,
      },
      {
        path: '/npdc2_ug',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        status: Page.STATUS_PUBLISHED,
        isEmpty: false,
        parent: rootPage._id,
      },
      {
        _id: pageIdDeleteComp1,
        path: '/npdc3_ug',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        status: Page.STATUS_PUBLISHED,
        isEmpty: false,
        parent: rootPage._id,
      },
      {
        _id: pageIdDeleteComp2,
        path: '/npdc3_ug/npdc4_ug',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdB,
        status: Page.STATUS_PUBLISHED,
        isEmpty: false,
        parent: pageIdDeleteComp1,
      },
      {
        path: '/npdc3_ug/npdc4_ug/npdc5_ug',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdC,
        status: Page.STATUS_PUBLISHED,
        isEmpty: false,
        parent: pageIdDeleteComp2,
      },
      {
        path: '/npdc3_ug/npdc4_ug',
        grant: Page.GRANT_RESTRICTED,
        status: Page.STATUS_PUBLISHED,
        isEmpty: false,
      },
    ]);

    /**
     * Revert
     */
    await Page.insertMany([
      {
        _id: pageIdRevert1,
        path: '/trash/np_revert1',
        grant: Page.GRANT_RESTRICTED,
        revision: revisionIdRevert1,
        status: Page.STATUS_DELETED,
      },
      {
        _id: pageIdRevert2,
        path: '/trash/np_revert2',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        revision: revisionIdRevert2,
        status: Page.STATUS_DELETED,
      },
      {
        _id: pageIdRevert3,
        path: '/trash/np_revert3',
        revision: revisionIdRevert3,
        status: Page.STATUS_DELETED,
        parent: rootPage._id,
      },
      {
        _id: pageIdRevert4,
        path: '/trash/np_revert3/middle/np_revert4',
        grant: Page.GRANT_RESTRICTED,
        revision: revisionIdRevert4,
        status: Page.STATUS_DELETED,
      },
      {
        _id: pageIdRevert5,
        path: '/trash/np_revert5',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        revision: revisionIdRevert5,
        status: Page.STATUS_DELETED,
      },
      {
        _id: pageIdRevert6,
        path: '/trash/np_revert5/middle/np_revert6',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdB,
        revision: revisionIdRevert6,
        status: Page.STATUS_DELETED,
      },
    ]);
    await Revision.insertMany([
      {
        _id: revisionIdRevert1,
        pageId: pageIdRevert1,
        body: 'np_revert1',
        format: 'markdown',
        author: dummyUser1._id,
      },
      {
        _id: revisionIdRevert2,
        pageId: pageIdRevert2,
        body: 'np_revert2',
        format: 'markdown',
        author: npDummyUser1,
      },
      {
        _id: revisionIdRevert3,
        pageId: pageIdRevert3,
        body: 'np_revert3',
        format: 'markdown',
        author: npDummyUser1,
      },
      {
        _id: revisionIdRevert4,
        pageId: pageIdRevert4,
        body: 'np_revert4',
        format: 'markdown',
        author: npDummyUser1,
      },
      {
        _id: revisionIdRevert5,
        pageId: pageIdRevert5,
        body: 'np_revert5',
        format: 'markdown',
        author: npDummyUser1,
      },
      {
        _id: revisionIdRevert6,
        pageId: pageIdRevert6,
        body: 'np_revert6',
        format: 'markdown',
        author: npDummyUser1,
      },
    ]);

    await Tag.insertMany([
      { _id: tagIdRevert1, name: 'np_revertTag1' },
      { _id: tagIdRevert2, name: 'np_revertTag2' },
    ]);

    await PageTagRelation.insertMany([
      {
        relatedPage: pageIdRevert1,
        relatedTag: tagIdRevert1,
        isPageTrashed: true,
      },
      {
        relatedPage: pageIdRevert2,
        relatedTag: tagIdRevert2,
        isPageTrashed: true,
      },
    ]);
  });

  describe('Rename', () => {
    test('dummy test to avoid test failure', async() => {
      // write test code
      expect(true).toBe(true);
    });
  });
  describe('Duplicate', () => {
    // test('', async() => {
    //   // write test code
    // });
  });
  describe('Delete', () => {
    // test('', async() => {
    //   // write test code
    // });
  });
  describe('Delete completely', () => {
    const deleteCompletely = async(page, user, options = {}, isRecursively = false, preventEmitting = false) => {
      const mockedDeleteCompletelyRecursivelyMainOperation = jest.spyOn(crowi.pageService, 'deleteCompletelyRecursivelyMainOperation').mockReturnValue(null);
      const mockedCreateAndSendNotifications = jest.spyOn(crowi.pageService, 'createAndSendNotifications').mockReturnValue(null);

      await crowi.pageService.deleteCompletely(page, user, options, isRecursively, preventEmitting);

      const argsForDeleteCompletelyRecursivelyMainOperation = mockedDeleteCompletelyRecursivelyMainOperation.mock.calls[0];

      mockedDeleteCompletelyRecursivelyMainOperation.mockRestore();
      mockedCreateAndSendNotifications.mockRestore();

      if (isRecursively) {
        await crowi.pageService.deleteCompletelyRecursivelyMainOperation(...argsForDeleteCompletelyRecursivelyMainOperation);
      }

      return;
    };

    describe('Delete single page with grant RESTRICTED', () => {
      test('should be able to delete completely', async() => {
        const _path = '/npdc1_awl';
        const _page = await Page.findOne({ path: _path, grant: Page.GRANT_RESTRICTED });
        expect(_page).toBeTruthy();

        await deleteCompletely(_page, dummyUser1, {}, false);

        const page = await Page.findOne({ path: _path, grant: Page.GRANT_RESTRICTED });
        expect(page).toBeNull();
      });
    });
    describe('Delete single page with grant USER_GROUP', () => {
      test('should be able to delete completely', async() => {
        const _path = '/npdc2_ug';
        const _page = await Page.findOne({ path: _path, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdA });
        expect(_page).toBeTruthy();

        await deleteCompletely(_page, npDummyUser1, {}, false);

        const page = await Page.findOne({ path: _path, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdA });
        expect(page).toBeNull();
      });
    });
    describe('Delete multiple pages with grant USER_GROUP', () => {
      test('should be able to delete all descendants completely except page with GRANT_RESTRICTED', async() => {
        const _path1 = '/npdc3_ug';
        const _path2 = '/npdc3_ug/npdc4_ug';
        const _path3 = '/npdc3_ug/npdc4_ug/npdc5_ug';
        const _page1 = await Page.findOne({ path: _path1, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdA });
        const _page2 = await Page.findOne({ path: _path2, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdB });
        const _page3 = await Page.findOne({ path: _path3, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdC });
        const _page4 = await Page.findOne({ path: _path2, grant: Page.GRANT_RESTRICTED });
        expect(_page1).toBeTruthy();
        expect(_page2).toBeTruthy();
        expect(_page3).toBeTruthy();
        expect(_page4).toBeTruthy();

        await deleteCompletely(_page1, npDummyUser1, {}, true);

        const page1 = await Page.findOne({ path: _path1, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdA });
        const page2 = await Page.findOne({ path: _path2, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdB });
        const page3 = await Page.findOne({ path: _path3, grant: Page.GRANT_USER_GROUP, grantedGroup: groupIdC });
        const page4 = await Page.findOne({ path: _path2, grant: Page.GRANT_RESTRICTED });

        expect(page1).toBeNull();
        expect(page2).toBeNull();
        expect(page3).toBeNull();
        expect(page4).toBeTruthy();
      });
    });
  });
  describe('revert', () => {
    const revertDeletedPage = async(page, user, options = {}, isRecursively = false) => {
      // mock return value
      const mockedRevertRecursivelyMainOperation = jest.spyOn(crowi.pageService, 'revertRecursivelyMainOperation').mockReturnValue(null);
      const revertedPage = await crowi.pageService.revertDeletedPage(page, user, options, isRecursively);

      const argsForRecursivelyMainOperation = mockedRevertRecursivelyMainOperation.mock.calls[0];

      // restores the original implementation
      mockedRevertRecursivelyMainOperation.mockRestore();
      if (isRecursively) {
        await crowi.pageService.revertRecursivelyMainOperation(...argsForRecursivelyMainOperation);
      }

      return revertedPage;

    };
    test('should revert single deleted page with GRANT_RESTRICTED', async() => {
      const trashedPage = await Page.findOne({ path: '/trash/np_revert1', status: Page.STATUS_DELETED, grant: Page.GRANT_RESTRICTED });
      const revision = await Revision.findOne({ pageId: trashedPage._id });
      const tag = await Tag.findOne({ name: 'np_revertTag1' });
      const deletedPageTagRelation = await PageTagRelation.findOne({ relatedPage: trashedPage._id, relatedTag: tag._id, isPageTrashed: true });
      expectAllToBeTruthy([trashedPage, revision, tag, deletedPageTagRelation]);

      await revertDeletedPage(trashedPage, dummyUser1, {}, false);
      const revertedPage = await Page.findOne({ path: '/np_revert1' });
      const deltedPageBeforeRevert = await Page.findOne({ path: '/trash/np_revert1' });
      const pageTagRelation = await PageTagRelation.findOne({ relatedPage: revertedPage._id, relatedTag: tag._id });
      expectAllToBeTruthy([revertedPage, pageTagRelation]);

      expect(deltedPageBeforeRevert).toBeNull();

      // page with GRANT_RESTRICTED does not have parent
      expect(revertedPage.parent).toBeNull();
      expect(revertedPage.status).toBe(Page.STATUS_PUBLISHED);
      expect(revertedPage.grant).toBe(Page.GRANT_RESTRICTED);
      expect(pageTagRelation.isPageTrashed).toBe(false);
    });
    test('should revert single deleted page with GRANT_USER_GROUP', async() => {
      const beforeRevertPath = '/trash/np_revert2';
      const user1 = await User.findOne({ name: 'npUser1' });
      const trashedPage = await Page.findOne({ path: beforeRevertPath, status: Page.STATUS_DELETED, grant: Page.GRANT_USER_GROUP });
      const revision = await Revision.findOne({ pageId: trashedPage._id });
      const tag = await Tag.findOne({ name: 'np_revertTag2' });
      const deletedPageTagRelation = await PageTagRelation.findOne({ relatedPage: trashedPage._id, relatedTag: tag._id, isPageTrashed: true });
      expectAllToBeTruthy([trashedPage, revision, tag, deletedPageTagRelation]);

      await revertDeletedPage(trashedPage, user1, {}, false);
      const revertedPage = await Page.findOne({ path: '/np_revert2' });
      const trashedPageBR = await Page.findOne({ path: beforeRevertPath });
      const pageTagRelation = await PageTagRelation.findOne({ relatedPage: revertedPage._id, relatedTag: tag._id });
      expectAllToBeTruthy([revertedPage, pageTagRelation]);
      expect(trashedPageBR).toBeNull();

      expect(revertedPage.parent).toStrictEqual(rootPage._id);
      expect(revertedPage.status).toBe(Page.STATUS_PUBLISHED);
      expect(revertedPage.grant).toBe(Page.GRANT_USER_GROUP);
      expect(revertedPage.grantedGroup).toStrictEqual(groupIdA);
      expect(pageTagRelation.isPageTrashed).toBe(false);
    });
    test(`revert multiple pages: only target page should be reverted.
          Non-existant middle page and leaf page with GRANT_RESTRICTED shoud not be reverted`, async() => {
      const beforeRevertPath1 = '/trash/np_revert3';
      const beforeRevertPath2 = '/trash/np_revert3/middle/np_revert4';
      const trashedPage1 = await Page.findOne({ path: beforeRevertPath1, status: Page.STATUS_DELETED, grant: Page.GRANT_PUBLIC });
      const trashedPage2 = await Page.findOne({ path: beforeRevertPath2, status: Page.STATUS_DELETED, grant: Page.GRANT_RESTRICTED });
      const revision1 = await Revision.findOne({ pageId: trashedPage1._id });
      const revision2 = await Revision.findOne({ pageId: trashedPage2._id });
      expectAllToBeTruthy([trashedPage1, trashedPage2, revision1, revision2]);

      await revertDeletedPage(trashedPage1, npDummyUser2, {}, true);
      const revertedPage = await Page.findOne({ path: '/np_revert3' });
      const middlePage = await Page.findOne({ path: '/np_revert3/middle' });
      const notRestrictedPage = await Page.findOne({ path: '/np_revert3/middle/np_revert4' });
      // AR => After Revert
      const trashedPage1AR = await Page.findOne({ path: beforeRevertPath1 });
      const trashedPage2AR = await Page.findOne({ path: beforeRevertPath2 });
      const revision1AR = await Revision.findOne({ pageId: revertedPage._id });
      const revision2AR = await Revision.findOne({ pageId: trashedPage2AR._id });
      expectAllToBeTruthy([revertedPage, trashedPage2AR, revision1AR, revision2AR]);
      expect(trashedPage1AR).toBeNull();
      expect(notRestrictedPage).toBeNull();
      expect(middlePage).toBeNull();

      expect(revertedPage.parent).toStrictEqual(rootPage._id);
      expect(revertedPage.status).toBe(Page.STATUS_PUBLISHED);
      expect(revertedPage.grant).toBe(Page.GRANT_PUBLIC);
    });
    test('revert multiple pages: target page, initially non-existant page and leaf page with GRANT_USER_GROUP shoud be reverted', async() => {
      const user = await User.findOne({ _id: npDummyUser3 });
      const beforeRevertPath1 = '/trash/np_revert5';
      const beforeRevertPath2 = '/trash/np_revert5/middle/np_revert6';
      const beforeRevertPath3 = '/trash/np_revert5/middle';
      const trashedPage1 = await Page.findOne({ path: beforeRevertPath1, status: Page.STATUS_DELETED, grant: Page.GRANT_USER_GROUP });
      const trashedPage2 = await Page.findOne({ path: beforeRevertPath2, status: Page.STATUS_DELETED, grant: Page.GRANT_USER_GROUP });
      const nonExistantPage3 = await Page.findOne({ path: beforeRevertPath3 }); // not exist
      const revision1 = await Revision.findOne({ pageId: trashedPage1._id });
      const revision2 = await Revision.findOne({ pageId: trashedPage2._id });
      expectAllToBeTruthy([trashedPage1, trashedPage2, revision1, revision2, user]);
      expect(nonExistantPage3).toBeNull();

      await revertDeletedPage(trashedPage1, user, {}, true);
      const revertedPage1 = await Page.findOne({ path: '/np_revert5' });
      const newlyCreatedPage = await Page.findOne({ path: '/np_revert5/middle' });
      const revertedPage2 = await Page.findOne({ path: '/np_revert5/middle/np_revert6' });

      // // AR => After Revert
      const trashedPage1AR = await Page.findOne({ path: beforeRevertPath1 });
      const trashedPage2AR = await Page.findOne({ path: beforeRevertPath2 });
      expectAllToBeTruthy([revertedPage1, newlyCreatedPage, revertedPage2]);
      expect(trashedPage1AR).toBeNull();
      expect(trashedPage2AR).toBeNull();

      expect(newlyCreatedPage.isEmpty).toBe(true);

      expect(revertedPage1.parent).toStrictEqual(rootPage._id);
      expect(revertedPage2.parent).toStrictEqual(newlyCreatedPage._id);
      expect(newlyCreatedPage.parent).toStrictEqual(revertedPage1._id);

      expect(revertedPage1.status).toBe(Page.STATUS_PUBLISHED);
      expect(revertedPage2.status).toBe(Page.STATUS_PUBLISHED);
      expect(newlyCreatedPage.status).toBe(Page.STATUS_PUBLISHED);

      expect(revertedPage1.grant).toBe(Page.GRANT_USER_GROUP);
      expect(revertedPage1.grant).toBe(Page.GRANT_USER_GROUP);
      expect(newlyCreatedPage.grant).toBe(Page.GRANT_PUBLIC);

    });
  });
});
