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

  /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expectAllToBeTruthy"] }] */
  // https://github.com/jest-community/eslint-plugin-jest/blob/v24.3.5/docs/rules/expect-expect.md#assertfunctionnames

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

    dummyUser1 = await User.findOne({ username: 'v5DummyUser1' });
    dummyUser2 = await User.findOne({ username: 'v5DummyUser2' });

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
      { _id: tagForDuplicate1, name: 'duplicate_Tag1' },
      { _id: tagForDuplicate2, name: 'duplicate_Tag2' },
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

    /**
     * Delete
     */
    const pageIdForDelete1 = new mongoose.Types.ObjectId();
    const pageIdForDelete2 = new mongoose.Types.ObjectId();
    const pageIdForDelete3 = new mongoose.Types.ObjectId();
    const pageIdForDelete4 = new mongoose.Types.ObjectId();
    const pageIdForDelete5 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        path: '/trash/v5_PageForDelete1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
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
      {
        _id: pageIdForDelete4,
        path: '/user',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        status: Page.STATUS_PUBLISHED,
        isEmpty: true,
      },
      {
        _id: pageIdForDelete5,
        path: '/user/v5DummyUser1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDelete4,
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

    /**
     * Revert
     */
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
      const childPageBeforeRename = await Page.findOne({ path: '/v5_ChildForRename1' });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
      expect(childPageBeforeRename).toBeNull();

    });

    test('Should rename/move to under empty page', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename2' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename2' });
      expectAllToBeTruthy([childPage, parentPage]);
      expect(parentPage.isEmpty).toBe(true);

      const newPath = '/v5_ParentForRename2/renamedChildForRename2';
      const renamedPage = await renamePage(childPage, newPath, dummyUser1, {});
      const childPageBeforeRename = await Page.findOne({ path: '/v5_ChildForRename2' });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(parentPage.isEmpty).toBe(true);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
      expect(childPageBeforeRename).toBeNull();
    });

    test('Should rename/move with option updateMetadata: true', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename3' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename3' });
      expectAllToBeTruthy([childPage, parentPage]);
      expect(childPage.lastUpdateUser).toStrictEqual(dummyUser1._id);

      const newPath = '/v5_ParentForRename3/renamedChildForRename3';
      const oldUpdateAt = childPage.updatedAt;
      const renamedPage = await renamePage(childPage, newPath, dummyUser2, { updateMetadata: true });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
      expect(renamedPage.lastUpdateUser).toStrictEqual(dummyUser2._id);
      expect(renamedPage.updatedAt.getFullYear()).toBeGreaterThan(oldUpdateAt.getFullYear());
    });

    test('Should move with option createRedirectPage: true', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename4' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename4' });
      expectAllToBeTruthy([parentPage, childPage]);

      const oldPath = childPage.path;
      const newPath = '/v5_ParentForRename4/renamedChildForRename4';
      const renamedPage = await renamePage(childPage, newPath, dummyUser2, { createRedirectPage: true });
      const pageRedirect = await PageRedirect.findOne({ fromPath: oldPath, toPath: renamedPage.path });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
      expect(pageRedirect).toBeTruthy();
    });

    test('Should rename/move with descendants', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename5' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename5' });
      const grandchild = await Page.findOne({ parent: childPage._id, path: '/v5_ChildForRename5/v5_GrandchildForRename5' });

      expectAllToBeTruthy([parentPage, childPage, grandchild]);

      const newPath = '/v5_ParentForRename5/renamedChildForRename5';
      const renamedPage = await renamePage(childPage, newPath, dummyUser1, {});
      // find child of renamed page
      const renamedGrandchild = await Page.findOne({ parent: renamedPage._id });
      const childPageBeforeRename = await Page.findOne({ path: '/v5_ChildForRename5' });
      const grandchildBeforeRename = await Page.findOne({ path: grandchild.path });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
      expect(childPageBeforeRename).toBeNull();
      expect(grandchildBeforeRename).toBeNull();
      // grandchild's parent should be the renamed page
      expect(renamedGrandchild.parent).toStrictEqual(renamedPage._id);
      expect(renamedGrandchild.path).toBe('/v5_ParentForRename5/renamedChildForRename5/v5_GrandchildForRename5');
    });

    test('Should rename/move empty page', async() => {
      const parentPage = await Page.findOne({ path: '/v5_ParentForRename7' });
      const childPage = await Page.findOne({ path: '/v5_ChildForRename7', isEmpty: true });
      const grandchild = await Page.findOne({ parent: childPage._id, path: '/v5_ChildForRename7/v5_GrandchildForRename7' });

      expectAllToBeTruthy([parentPage, childPage, grandchild]);

      const newPath = '/v5_ParentForRename7/renamedChildForRename7';
      const renamedPage = await renamePage(childPage, newPath, dummyUser1, {});
      const grandchildAfterRename = await Page.findOne({ parent: renamedPage._id });
      const grandchildBeforeRename = await Page.findOne({ path: '/v5_ChildForRename7/v5_GrandchildForRename7' });

      expect(xssSpy).toHaveBeenCalled();
      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.isEmpty).toBe(true);
      expect(renamedPage.parent).toStrictEqual(parentPage._id);
      expect(grandchildBeforeRename).toBeNull();
      // grandchild's parent should be renamed page
      expect(grandchildAfterRename.parent).toStrictEqual(renamedPage._id);
      expect(grandchildAfterRename.path).toBe('/v5_ParentForRename7/renamedChildForRename7/v5_GrandchildForRename7');
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
      const page = await Page.findOne({ path: '/v5_PageForDuplicate1' });
      expectAllToBeTruthy([page]);

      const newPagePath = '/duplicatedv5PageForDuplicate1';
      const duplicatedPage = await duplicate(page, newPagePath, dummyUser1, false);

      const duplicatedRevision = await Revision.findOne({ pageId: duplicatedPage._id });
      const baseRevision = await Revision.findOne({ pageId: page._id });

      // new path
      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedPage._id).not.toStrictEqual(page._id);
      expect(duplicatedPage.revision).toStrictEqual(duplicatedRevision._id);
      expect(duplicatedRevision.body).toEqual(baseRevision.body);
    });

    test('Should NOT duplicate single empty page', async() => {
      const page = await Page.findOne({ path: '/v5_PageForDuplicate2' });
      expectAllToBeTruthy([page]);

      let isThrown;
      let duplicatedPage;
      try {
        const newPagePath = '/duplicatedv5PageForDuplicate2';
        duplicatedPage = await duplicate(page, newPagePath, dummyUser1, false);
      }
      catch (err) {
        isThrown = true;
      }

      expect(duplicatedPage).toBeUndefined();
      expect(isThrown).toBe(true);
    });

    test('Should duplicate multiple pages', async() => {
      const basePage = await Page.findOne({ path: '/v5_PageForDuplicate3' });
      const revision = await Revision.findOne({ pageId: basePage._id });
      const childPage1 = await Page.findOne({ path: '/v5_PageForDuplicate3/v5_Child_1_ForDuplicate3' }).populate({ path: 'revision', model: 'Revision' });
      const childPage2 = await Page.findOne({ path: '/v5_PageForDuplicate3/v5_Child_2_ForDuplicate3' }).populate({ path: 'revision', model: 'Revision' });
      const revisionForChild1 = childPage1.revision;
      const revisionForChild2 = childPage2.revision;
      expectAllToBeTruthy([basePage, revision, childPage1, childPage2, revisionForChild1, revisionForChild2]);

      const newPagePath = '/duplicatedv5PageForDuplicate3';
      const duplicatedPage = await duplicate(basePage, newPagePath, dummyUser1, true);
      const duplicatedChildPage1 = await Page.findOne({ parent: duplicatedPage._id, path: '/duplicatedv5PageForDuplicate3/v5_Child_1_ForDuplicate3' })
        .populate({ path: 'revision', model: 'Revision' });
      const duplicatedChildPage2 = await Page.findOne({ parent: duplicatedPage._id, path: '/duplicatedv5PageForDuplicate3/v5_Child_2_ForDuplicate3' })
        .populate({ path: 'revision', model: 'Revision' });
      const revisionForDuplicatedPage = await Revision.findOne({ pageId: duplicatedPage._id });
      const revisionBodyForDupChild1 = duplicatedChildPage1.revision;
      const revisionBodyForDupChild2 = duplicatedChildPage2.revision;

      expectAllToBeTruthy([duplicatedPage, duplicatedChildPage1, duplicatedChildPage2,
                           revisionForDuplicatedPage, revisionBodyForDupChild1, revisionBodyForDupChild2]);
      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedChildPage1.path).toBe('/duplicatedv5PageForDuplicate3/v5_Child_1_ForDuplicate3');
      expect(duplicatedChildPage2.path).toBe('/duplicatedv5PageForDuplicate3/v5_Child_2_ForDuplicate3');

    });

    test('Should duplicate multiple pages with empty child in it', async() => {
      const basePage = await Page.findOne({ path: '/v5_PageForDuplicate4' });
      const baseChild = await Page.findOne({ parent: basePage._id, isEmpty: true });
      const baseGrandchild = await Page.findOne({ parent: baseChild._id });
      expectAllToBeTruthy([basePage, baseChild, baseGrandchild]);

      const newPagePath = '/duplicatedv5PageForDuplicate4';
      const duplicatedPage = await duplicate(basePage, newPagePath, dummyUser1, true);
      const duplicatedChild = await Page.findOne({ parent: duplicatedPage._id });
      const duplicatedGrandchild = await Page.findOne({ parent: duplicatedChild._id });

      expect(xssSpy).toHaveBeenCalled();
      expectAllToBeTruthy([duplicatedPage, duplicatedGrandchild]);
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedChild.path).toBe('/duplicatedv5PageForDuplicate4/v5_empty_PageForDuplicate4');
      expect(duplicatedGrandchild.path).toBe('/duplicatedv5PageForDuplicate4/v5_empty_PageForDuplicate4/v5_grandchild_PageForDuplicate4');
      expect(duplicatedChild.isEmpty).toBe(true);
      expect(duplicatedGrandchild.parent).toStrictEqual(duplicatedChild._id);
      expect(duplicatedChild.parent).toStrictEqual(duplicatedPage._id);

    });

    test('Should duplicate tags', async() => {
      const basePage = await Page.findOne({ path: '/v5_PageForDuplicate5' });
      const tag1 = await Tag.findOne({ name: 'duplicate_Tag1' });
      const tag2 = await Tag.findOne({ name:  'duplicate_Tag2' });
      const basePageTagRelation1 = await PageTagRelation.findOne({ relatedTag: tag1._id });
      const basePageTagRelation2 = await PageTagRelation.findOne({ relatedTag: tag2._id });
      expectAllToBeTruthy([basePage, tag1, tag2, basePageTagRelation1, basePageTagRelation2]);

      const newPagePath = '/duplicatedv5PageForDuplicate5';
      const duplicatedPage = await duplicate(basePage, newPagePath, dummyUser1, false);
      const duplicatedTagRelations = await PageTagRelation.find({ relatedPage: duplicatedPage._id });

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedTagRelations.length).toBeGreaterThanOrEqual(2);
    });

    test('Should NOT duplicate comments', async() => {
      const basePage = await Page.findOne({ path: '/v5_PageForDuplicate6' });
      const basePageComments = await Comment.find({ page: basePage._id });
      expectAllToBeTruthy([basePage, ...basePageComments]);

      const newPagePath = '/duplicatedv5PageForDuplicate6';
      const duplicatedPage = await duplicate(basePage, newPagePath, dummyUser1, false);
      const duplicatedComments = await Comment.find({ page: duplicatedPage._id });

      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(basePageComments.length).not.toBe(duplicatedComments.length);
    });

    test('Should duplicate empty page with descendants', async() => {
      const basePage = await Page.findOne({ path: '/v5_empty_PageForDuplicate7' });
      const basePageChild = await Page.findOne({ parent: basePage._id }).populate({ path: 'revision', model: 'Revision' });
      const basePageGrandhild = await Page.findOne({ parent: basePageChild._id }).populate({ path: 'revision', model: 'Revision' });
      expectAllToBeTruthy([basePage, basePageChild, basePageGrandhild, basePageChild.revision, basePageGrandhild.revision]);

      const newPagePath = '/duplicatedv5EmptyPageForDuplicate7';
      const duplicatedPage = await duplicate(basePage, newPagePath, dummyUser1, true);
      const duplicatedChild = await Page.findOne({ parent: duplicatedPage._id }).populate({ path: 'revision', model: 'Revision' });
      const duplicatedGrandchild = await Page.findOne({ parent: duplicatedChild._id }).populate({ path: 'revision', model: 'Revision' });

      expectAllToBeTruthy([duplicatedPage, duplicatedChild, duplicatedGrandchild, duplicatedChild.revision, duplicatedGrandchild.revision]);
      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedPage.isEmpty).toBe(true);
      expect(duplicatedChild.revision.body).toBe(basePageChild.revision.body);
      expect(duplicatedGrandchild.revision.body).toBe(basePageGrandhild.revision.body);
      expect(duplicatedChild.path).toBe('/duplicatedv5EmptyPageForDuplicate7/v5_child_PageForDuplicate7');
      expect(duplicatedGrandchild.path).toBe('/duplicatedv5EmptyPageForDuplicate7/v5_child_PageForDuplicate7/v5_grandchild_PageForDuplicate7');
      expect(duplicatedGrandchild.parent).toStrictEqual(duplicatedChild._id);
      expect(duplicatedChild.parent).toStrictEqual(duplicatedPage._id);
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

      const page = await Page.findOne({ path: '/' });

      expect(isThrown).toBe(true);
      expect(page).toBeTruthy();
    });

    test('Should NOT delete trashed page', async() => {
      const trashedPage = await Page.findOne({ path: '/trash/v5_PageForDelete1' });
      expectAllToBeTruthy([trashedPage]);

      let isThrown;
      try { await deletePage(trashedPage, dummyUser1, {}, false) }
      catch (err) { isThrown = true }

      const page = await Page.findOne({ path: '/trash/v5_PageForDelete1' });

      expect(page).toBeTruthy();
      expect(isThrown).toBe(true);
    });

    test('Should NOT delete /user/hoge page', async() => {
      const dummyUser1Page = await Page.findOne({ path: '/user/v5DummyUser1' });
      expectAllToBeTruthy([dummyUser1Page]);

      let isThrown;
      try { await deletePage(dummyUser1Page, dummyUser1, {}, false) }
      catch (err) { isThrown = true }

      const page = await Page.findOne({ path: '/user/v5DummyUser1' });

      expect(page).toBeTruthy();
      expect(isThrown).toBe(true);
    });

    test('Should delete single page', async() => {
      const pageToDelete = await Page.findOne({ path: '/v5_PageForDelete2' });
      expectAllToBeTruthy([pageToDelete]);

      const deletedPage = await deletePage(pageToDelete, dummyUser1, {}, false);
      const page = await Page.findOne({ path: '/v5_PageForDelete2' });

      expect(page).toBeNull();
      expect(deletedPage.path).toBe(`/trash${pageToDelete.path}`);
      expect(deletedPage.parent).toBeNull();
      expect(deletedPage.status).toBe(Page.STATUS_DELETED);
    });

    test('Should delete multiple pages including empty child', async() => {
      const parentPage = await Page.findOne({ path: '/v5_PageForDelete3' });
      const childPage = await Page.findOne({ path: '/v5_PageForDelete3/v5_PageForDelete4' });
      const grandchildPage = await Page.findOne({ path: '/v5_PageForDelete3/v5_PageForDelete4/v5_PageForDelete5' });
      expectAllToBeTruthy([parentPage, childPage, grandchildPage]);

      const deletedParentPage = await deletePage(parentPage, dummyUser1, {}, true);
      const deletedChildPage = await Page.findOne({ path: '/trash/v5_PageForDelete3/v5_PageForDelete4' });
      const deletedGrandchildPage = await Page.findOne({ path: '/trash/v5_PageForDelete3/v5_PageForDelete4/v5_PageForDelete5' });

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
      const pageToDelete = await Page.findOne({ path: '/v5_PageForDelete6' });
      const tag1 = await Tag.findOne({ name: 'TagForDelete1' });
      const tag2 = await Tag.findOne({ name: 'TagForDelete2' });
      const pageRelation1 = await PageTagRelation.findOne({ relatedTag: tag1._id });
      const pageRelation2 = await PageTagRelation.findOne({ relatedTag: tag2._id });
      expectAllToBeTruthy([pageToDelete, tag1, tag2, pageRelation1, pageRelation2]);

      const deletedPage = await deletePage(pageToDelete, dummyUser1, {}, false);
      const page = await Page.findOne({ path: '/v5_PageForDelete6' });
      const deletedTagRelation1 = await PageTagRelation.findOne({ _id: pageRelation1._id });
      const deletedTagRelation2 = await PageTagRelation.findOne({ _id: pageRelation2._id });

      expect(page).toBe(null);
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
      try { await deleteCompletely(rootPage, dummyUser1, {}, false) }
      catch (err) { isThrown = true }
      const page = await Page.findOne({ path: '/' });
      expect(page).toBeTruthy();
      expect(isThrown).toBe(true);
    });
    test('Should completely delete single page', async() => {
      const page = await Page.findOne({ path: '/v5_PageForDeleteCompletely1' });
      expectAllToBeTruthy([page]);

      await deleteCompletely(page, dummyUser1, {}, false);
      const deletedPage = await Page.findOne({ _id: page._id, path: '/v5_PageForDeleteCompletely1' });

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
      expect(deletedPages.length).toBe(0);
      // revision should be null
      expect(deletedRevisions.length).toBe(0);
      // tag should be Truthy
      expectAllToBeTruthy(tags);
      // pageTagRelation should be null
      expect(deletedPageTagRelations.length).toBe(0);
      // bookmark should be null
      expect(deletedBookmarks.length).toBe(0);
      // comment should be null
      expect(deletedComments.length).toBe(0);
      // pageRedirect should be null
      expect(deletedPageRedirects.length).toBe(0);
      // sharelink should be null
      expect(deletedShareLinks.length).toBe(0);
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
    test('Should completely deleting page in the middle results in having an empty page', async() => {
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
      const deletedPage = await Page.findOne({ path: '/trash/v5_revert1', status: Page.STATUS_DELETED });
      const revision = await Revision.findOne({ pageId: deletedPage._id });
      const tag = await Tag.findOne({ name: 'revertTag1' });
      const deletedPageTagRelation = await PageTagRelation.findOne({ relatedPage: deletedPage._id, relatedTag: tag._id, isPageTrashed: true });
      expectAllToBeTruthy([deletedPage, revision, tag, deletedPageTagRelation]);

      const revertedPage = await revertDeletedPage(deletedPage, dummyUser1, {}, false);
      const pageTagRelation = await PageTagRelation.findOne({ relatedPage: deletedPage._id, relatedTag: tag._id });

      expect(revertedPage.parent).toStrictEqual(rootPage._id);
      expect(revertedPage.path).toBe('/v5_revert1');
      expect(revertedPage.status).toBe(Page.STATUS_PUBLISHED);
      expect(pageTagRelation.isPageTrashed).toBe(false);

    });

    test('revert multiple deleted page (has non existent page in the middle)', async() => {
      const deletedPage1 = await Page.findOne({ path: '/trash/v5_revert2', status: Page.STATUS_DELETED });
      const deletedPage2 = await Page.findOne({ path: '/trash/v5_revert2/v5_revert3/v5_revert4', status: Page.STATUS_DELETED });
      const revision1 = await Revision.findOne({ pageId: deletedPage1._id });
      const revision2 = await Revision.findOne({ pageId: deletedPage2._id });
      expectAllToBeTruthy([deletedPage1, deletedPage2, revision1, revision2]);

      const revertedPage1 = await revertDeletedPage(deletedPage1, dummyUser1, {}, true);
      const revertedPage2 = await Page.findOne({ _id: deletedPage2._id });
      const newlyCreatedPage = await Page.findOne({ path: '/v5_revert2/v5_revert3' });

      expectAllToBeTruthy([revertedPage1, revertedPage2, newlyCreatedPage]);
      expect(revertedPage1.parent).toStrictEqual(rootPage._id);
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
