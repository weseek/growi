import { addSeconds } from 'date-fns';
import mongoose from 'mongoose';

import { PageActionStage, PageActionType } from '../../../src/server/models/page-operation';
import { getInstance } from '../setup-crowi';


describe('Test page service methods', () => {
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
  let PageOperation;
  let xssSpy;

  let rootPage;

  let dummyUser1;
  let dummyUser2;
  let globalGroupUser1;
  let globalGroupUser2;
  let globalGroupUser3;
  let globalGroupIsolate;
  let globalGroupA;
  let globalGroupB;
  let globalGroupC;

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
    PageOperation = mongoose.model('PageOperation');

    /*
     * Common
     */
    xssSpy = jest.spyOn(crowi.xss, 'process').mockImplementation(path => path);

    // ***********************************************************************************************************
    // * Do NOT change properties of globally used documents. Otherwise, it might cause some errors in other tests
    // ***********************************************************************************************************
    // users
    dummyUser1 = await User.findOne({ username: 'v5DummyUser1' });
    dummyUser2 = await User.findOne({ username: 'v5DummyUser2' });
    globalGroupUser1 = await User.findOne({ username: 'gGroupUser1' });
    globalGroupUser2 = await User.findOne({ username: 'gGroupUser2' });
    globalGroupUser3 = await User.findOne({ username: 'gGroupUser3' });
    // groups
    globalGroupIsolate = await UserGroup.findOne({ name: 'globalGroupIsolate' });
    globalGroupA = await UserGroup.findOne({ name: 'globalGroupA' });
    globalGroupB = await UserGroup.findOne({ name: 'globalGroupB' });
    globalGroupC = await UserGroup.findOne({ name: 'globalGroupC' });
    // page
    rootPage = await Page.findOne({ path: '/' });


    /**
     * pages
     */
    const pageId0 = new mongoose.Types.ObjectId();
    const pageId1 = new mongoose.Types.ObjectId();
    const pageId2 = new mongoose.Types.ObjectId();
    const pageId3 = new mongoose.Types.ObjectId();
    const pageId4 = new mongoose.Types.ObjectId();
    const pageId5 = new mongoose.Types.ObjectId();
    const pageId6 = new mongoose.Types.ObjectId();
    const pageId7 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        _id: pageId0,
        path: '/resume_rename_0',
        parent: rootPage._id,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 0,
        isEmpty: false,
      },
      {
        _id: pageId1,
        path: '/resume_rename_0/resume_rename_1',
        parent: pageId0._id,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 2,
        isEmpty: false,
      },
      {
        _id: pageId2,
        path: '/resume_rename_1/resume_rename_2',
        parent: pageId1,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 1,
        isEmpty: false,
      },
      {
        _id: pageId3,
        path: '/resume_rename_1/resume_rename_2/resume_rename_3',
        parent: pageId2,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 0,
        isEmpty: false,
      },
      {
        _id: pageId4,
        path: '/resume_rename_4',
        parent: rootPage._id,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 0,
        isEmpty: false,
      },
      {
        _id: pageId5,
        path: '/resume_rename_4/resume_rename_5',
        parent: pageId0._id,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 1,
        isEmpty: false,
      },
      {
        _id: pageId6,
        path: '/resume_rename_5/resume_rename_6',
        parent: pageId5,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 0,
        isEmpty: false,
      },
      {
        _id: pageId7,
        path: '/POP2',
        parent: rootPage._id,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 0,
        isEmpty: false,
      },
    ]);

    /**
     * PageOperation
     */
    const pageOpId1 = new mongoose.Types.ObjectId();
    const pageOpId2 = new mongoose.Types.ObjectId();
    const pageOpId3 = new mongoose.Types.ObjectId();
    const pageOpId4 = new mongoose.Types.ObjectId();
    const pageOpRevisionId1 = new mongoose.Types.ObjectId();
    const pageOpRevisionId2 = new mongoose.Types.ObjectId();
    const pageOpRevisionId3 = new mongoose.Types.ObjectId();
    const pageOpRevisionId4 = new mongoose.Types.ObjectId();
    await PageOperation.insertMany([
      {
        _id: pageOpId1,
        actionType: 'Rename',
        actionStage: 'Sub',
        fromPath: '/resume_rename_1',
        toPath: '/resume_rename_0/resume_rename_1',
        page: {
          _id: pageId1,
          parent: rootPage._id,
          descendantCount: 2,
          isEmpty: false,
          path: '/resume_rename_1',
          revision: pageOpRevisionId1,
          status: 'published',
          grant: 1,
          grantedUsers: [],
          grantedGroup: null,
          creator: dummyUser1._id,
          lastUpdateUser: dummyUser1._id,
        },
        user: {
          _id: dummyUser1._id,
        },
        options: {
          createRedirectPage: false,
          updateMetadata: true,
        },
        unprocessableExpiryDate: null,
      },
      {
        _id: pageOpId2,
        actionType: 'Rename',
        actionStage: 'Sub',
        fromPath: '/resume_rename_5',
        toPath: '/resume_rename_4/resume_rename_5',
        page: {
          _id: pageId5,
          parent: rootPage._id,
          descendantCount: 2,
          isEmpty: false,
          path: '/resume_rename_5',
          revision: pageOpRevisionId2,
          status: 'published',
          grant: 1,
          grantedUsers: [],
          grantedGroup: null,
          creator: dummyUser1._id,
          lastUpdateUser: dummyUser1._id,
        },
        user: {
          _id: dummyUser1._id,
        },
        options: {
          createRedirectPage: false,
          updateMetadata: true,
        },
        unprocessableExpiryDate: new Date(),
      },
      {
        _id: pageOpId3,
        actionType: 'Rename',
        actionStage: 'Sub',
        fromPath: '/POP2',
        // toPath NOT exist
        page: {
          _id: pageId7,
          parent: rootPage._id,
          descendantCount: 2,
          isEmpty: false,
          path: '/POP2',
          revision: pageOpRevisionId3,
          status: 'published',
          grant: 1,
          grantedUsers: [],
          grantedGroup: null,
          creator: dummyUser1._id,
          lastUpdateUser: dummyUser1._id,
        },
        user: {
          _id: dummyUser1._id,
        },
        options: {
          createRedirectPage: false,
          updateMetadata: true,
        },
        unprocessableExpiryDate: new Date(),
      },
    ]);
  });

  describe('restart renameOperation', () => {
    const resumeRenameSubOperation = async(page) => {
      const mockedRenameSubOperation = jest.spyOn(crowi.pageService, 'renameSubOperation').mockReturnValue(null);
      await crowi.pageService.resumeRenameSubOperation(page);

      const argsForRenameSubOperation = mockedRenameSubOperation.mock.calls[0];

      mockedRenameSubOperation.mockRestore();
      await crowi.pageService.renameSubOperation(...argsForRenameSubOperation);
    };

    test('it should successfully restart rename operation', async() => {
      // paths before renaming
      const _path0 = '/resume_rename_0'; // will not be renamed
      const _path1 = '/resume_rename_0/resume_rename_1'; // renamed already
      const _path2 = '/resume_rename_1/resume_rename_2'; // not renamed yet
      const _path3 = '/resume_rename_1/resume_rename_2/resume_rename_3'; // not renamed yet

      // paths after renaming
      const path0 = '/resume_rename_0';
      const path1 = '/resume_rename_0/resume_rename_1';
      const path2 = '/resume_rename_0/resume_rename_1/resume_rename_2';
      const path3 = '/resume_rename_0/resume_rename_1/resume_rename_2/resume_rename_3';

      // page
      const _page0 = await Page.findOne({ path: _path0 });
      const _page1 = await Page.findOne({ path: _path1 });
      const _page2 = await Page.findOne({ path: _path2 });
      const _page3 = await Page.findOne({ path: _path3 });
      expect(_page0).toBeTruthy();
      expect(_page1).toBeTruthy();
      expect(_page2).toBeTruthy();
      expect(_page3).toBeTruthy();
      // page operation
      const _pageOperation = await PageOperation.findOne({ 'page._id': _page1._id, actionType: PageActionType.Rename });
      expect(_pageOperation).toBeTruthy();

      await resumeRenameSubOperation(_page1);

      // page
      const page0 = await Page.findById(_page0._id);
      const page1 = await Page.findById(_page1._id);
      const page2 = await Page.findById(_page2._id);
      const page3 = await Page.findById(_page3._id);
      expect(page0).toBeTruthy();
      expect(page1).toBeTruthy();
      expect(page2).toBeTruthy();
      expect(page3).toBeTruthy();
      expect(page0.path).toBe(path0);
      expect(page1.path).toBe(path1);
      expect(page2.path).toBe(path2);
      expect(page3.path).toBe(path3);

      // page operation
      const pageOperation = await PageOperation.findById(_pageOperation._id);
      expect(pageOperation).toBeNull(); // should not exist

      expect(page0.descendantCount).toBe(3);
      expect(page1.parent).toStrictEqual(page0._id);
      expect(page2.parent).toStrictEqual(page1._id);
      expect(page3.parent).toStrictEqual(page2._id);
      expect(page0.descendantCount).toBe(3);
      expect(page1.descendantCount).toBe(2);
      expect(page2.descendantCount).toBe(1);
      expect(page3.descendantCount).toBe(0);
    });

    test('it should fail and throw error if PageOperation is not found', async() => {
      const notExistPageOp = {
        _id: new mongoose.Types.ObjectId(),
        actionType: 'Rename',
        actionStage: 'Sub',
        fromPath: '/FROM_NOT_EXIST',
        toPath: 'TO_NOT_EXIST',
        page: {
          _id: new mongoose.Types.ObjectId(),
          parent: rootPage._id,
          descendantCount: 2,
          isEmpty: false,
          path: '/NOT_EXIST_PAGE',
          revision: new mongoose.Types.ObjectId(),
          status: 'published',
          grant: 1,
          grantedUsers: [],
          grantedGroup: null,
          creator: dummyUser1._id,
          lastUpdateUser: dummyUser1._id,
        },
        user: {
          _id: dummyUser1._id,
        },
        options: {
          createRedirectPage: false,
          updateMetadata: false,
        },
        unprocessableExpiryDate: new Date(),
      };

      await expect(resumeRenameSubOperation(notExistPageOp))
        .rejects.toThrow(new Error('There is nothing to be processed right now'));
    });

    test('it should fail and throw error if the current time is behind unprocessableExpiryDate', async() => {
      // path
      const _path0 = '/resume_rename_4';
      const _path1 = '/resume_rename_4/resume_rename_5'; // renamed already
      const _path2 = '/resume_rename_5/resume_rename_6'; // not renamed yet
      // page
      const _page0 = await Page.findOne({ path: _path0 });
      const _page1 = await Page.findOne({ path: _path1 });
      const _page2 = await Page.findOne({ path: _path2 });
      // page operation
      const _pageOperation = await PageOperation.findOne({ 'page._id': _page1._id, actionType: PageActionType.Rename, actionStage: PageActionStage.Sub });
      expect(_pageOperation).toBeTruthy();

      // Make `unprocessableExpiryDate` 15 seconds ahead of current time.
      // The number 15 seconds has no meaning other than placing time in the furue.
      await PageOperation.findByIdAndUpdate(_pageOperation._id, { unprocessableExpiryDate: addSeconds(new Date(), 15) });

      expect(_page0).toBeTruthy();
      expect(_page1).toBeTruthy();
      expect(_page2).toBeTruthy();

      await expect(resumeRenameSubOperation(_page1)).rejects.toThrow(new Error('This page operation is currently being processed'));
    });

    test('Missing property(toPath) for PageOperation should throw error', async() => {
      // path
      const _path1 = '/POP2';
      // page
      const _page1 = await Page.findOne({ path: _path1 });
      // page operation
      const _pageOperation = await PageOperation.findOne({ 'page._id': _page1._id, actionType: PageActionType.Rename });

      expect(_page1).toBeTruthy();
      expect(_pageOperation).toBeTruthy();

      const promise = resumeRenameSubOperation(_page1);
      await expect(promise).rejects.toThrow(new Error(`Property toPath is missing which is needed to resume page operation(${_pageOperation._id})`));
    });
  });
});
