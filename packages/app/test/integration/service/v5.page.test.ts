import mongoose from 'mongoose';

import { PageActionType } from '../../../src/server/models/page-operation';
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
    const pageId1 = new mongoose.Types.ObjectId();
    const pageId2 = new mongoose.Types.ObjectId();
    const pageId3 = new mongoose.Types.ObjectId();
    const pageId4 = new mongoose.Types.ObjectId();

    await Page.insertMany([
      {
        _id: pageId1,
        path: '/renamePOP1',
        parent: rootPage._id,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 3,
      },
      {
        _id: pageId2,
        path: '/renamePOP1/renamePOP2',
        parent: pageId1,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 2,
      },
      {
        _id: pageId3,
        path: '/_renamePOP1/renamePOP2/renamePOP3',
        parent: pageId2,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 1,
      },
      {
        _id: pageId4,
        path: '/_renamePOP1/renamePOP2/renamePOP3/renamePOP4',
        parent: pageId3,
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        descendantCount: 0,
      },
    ]);

    /**
     * PageOperation
     */
    const pageOpId1 = new mongoose.Types.ObjectId();
    const pageOpRevisionId1 = new mongoose.Types.ObjectId();
    await PageOperation.insertMany([
      {
        _id: pageOpId1,
        actionType: 'Rename',
        actionStage: 'Main',
        fromPath: '/_renamePOP1',
        toPath: '/renamePOP1',
        page: {
          _id: pageId1,
          parent: rootPage._id,
          descendantCount: 1,
          isEmpty: false,
          path: '/_renamePOP1',
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
        isFailure: true,
      },
    ]);
  });

  describe('restart renameOperation', () => {
    const restartPageRenameOperation = async(pageOperationId) => {
      const mockedRenameSubOperation = jest.spyOn(crowi.pageService, 'renameSubOperation').mockReturnValue(null);

      await crowi.pageService.restartPageRenameOperation(pageOperationId);

      const argsForRenameSubOperation = mockedRenameSubOperation.mock.calls[0];

      mockedRenameSubOperation.mockRestore();
      await crowi.pageService.renameSubOperation(...argsForRenameSubOperation);
    };
    test('it should successfully restart rename operation', async() => {
      const _path1 = '/renamePOP1';
      const _path2 = '/renamePOP1/renamePOP2';
      const _path3 = '/_renamePOP1/renamePOP2/renamePOP3'; // not processed
      const _path4 = '/_renamePOP1/renamePOP2/renamePOP3/renamePOP4'; // not processed
      const _page1 = await Page.findOne({ path: _path1 });
      const _page2 = await Page.findOne({ path: _path2 });
      const _page3 = await Page.findOne({ path: _path3 });
      const _page4 = await Page.findOne({ path: _path4 });
      expect(_page1).toBeTruthy();
      expect(_page2).toBeTruthy();
      expect(_page3).toBeTruthy();
      expect(_page4).toBeTruthy();
      const _pageOperation = await PageOperation.findOne({ 'page.id': _page1._id, actionType: PageActionType.Rename, isFailure: true });
      expect(_pageOperation).toBeTruthy();

      await restartPageRenameOperation(_pageOperation._id);

      const path1 = '/renamePOP1';
      const path2 = '/renamePOP1/renamePOP2';
      const path3 = '/renamePOP1/renamePOP2/renamePOP3';
      const path4 = '/renamePOP1/renamePOP2/renamePOP3/renamePOP4';
      const page1 = await Page.findOne({ path: path1 });
      const page2 = await Page.findOne({ path: path2 });
      const page3 = await Page.findOne({ path: path3 });
      const page4 = await Page.findOne({ path: path4 });
      const pageOperation = await PageOperation.findOne({ _id: _pageOperation._id });
      expect(page1).toBeTruthy();
      expect(page2).toBeTruthy();
      expect(page3).toBeTruthy();
      expect(page4).toBeTruthy();
      expect(pageOperation).toBeNull();
      expect(page1.parent).toStrictEqual(rootPage._id);
      expect(page2.parent).toStrictEqual(page1._id);
      expect(page3.parent).toStrictEqual(page2._id);
      expect(page4.parent).toStrictEqual(page3._id);
    });
    test('it should fail when PageOperation is not found', async() => {});
  });
});
