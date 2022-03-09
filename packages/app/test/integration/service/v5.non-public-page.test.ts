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

    /*
     * Common
     */

    dummyUser1 = await User.findOne({ username: 'v5DummyUser1' });
    dummyUser2 = await User.findOne({ username: 'v5DummyUser2' });

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
    const groupIdA = new mongoose.Types.ObjectId();
    const groupIdB = new mongoose.Types.ObjectId();
    const groupIdC = new mongoose.Types.ObjectId();
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

    // 軽く数合わせ程度しかしてないので、データの中身はひと通り見直しお願いします。
    await Page.insertMany([
      // ケース1-1: GRNAT_RESTRICTED 単一ページの duplicate
      {
        _id: pageIdForDuplicate1,
        path: '/np_PageForDuplicate1',
        grant: Page.GRANT_RESTRICTED,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        // parent: rootPage._id,
        revision: revisionIdForDuplicate1,
      },
      // ケース1-2: 子ページに GRANT_RESTRICTED がある場合の再帰的 duplicate
      {
        _id: pageIdForDuplicate2,
        path: '/np_PageForDuplicate2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForDuplicate2,
      },
      {
        _id: pageIdForDuplicate3,
        path: '/np_PageForDuplicate2/np_ChildForDuplicate2',
        grant: Page.GRANT_RESTRICTED,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        // parent: pageIdForDuplicate2,
        revision: revisionIdForDuplicate3,
      },
      // ケース1-3: そこそこ上階層のパスに GRNAT_RESTRICTED があり、該当ページパスを含む子ページが存在する場合の、 GRNAT_RESTRICTED ページの duplicate
      {
        _id: pageIdForDuplicate4,
        path: '/np_PageForDuplicate3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForDuplicate4,
      },
      {
        _id: pageIdForDuplicate5,
        path: '/np_PageForDuplicate3/np_Child_1_ForDuplicate3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate4,
        revision: revisionIdForDuplicate5,
      },
      {
        _id: pageIdForDuplicate6,
        path: '/np_PageForDuplicate3/',
        grant: Page.GRANT_RESTRICTED,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        // parent: pageIdForDuplicate4,
      },
      // ---------- ↑ ここまでは軽く Page の中身まで見ている ↑ ---------- //
      // ケース2-1: GRNAT_USER_GROUP 単一ページの duplicate
      {
        _id: pageIdForDuplicate7,
        path: '/np_PageForDuplicate4',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: ,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForDuplicate6,
      },
      // ケース2-2: GRNAT_USER_GROUP が親で、その配下に同じグループで GRNAT_USER_GROUP の子孫がある場合の親ページの duplicate
      {
        _id: pageIdForDuplicate8,
        path: '/np_PageForDuplicate5',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        _id: pageIdForDuplicate9,
        path: '/np_PageForDuplicate5/np_empty_PageForDuplicate5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate8,
        revision: revisionIdForDuplicate7,
      },
      {
        _id: pageIdForDuplicate10,
        path: '/np_PageForDuplicate5/np_empty_PageForDuplicate5/np_grandchild_PageForDuplicate5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate9,
        revision: revisionIdForDuplicate8,
      },
      // ケース2-3: GRNAT_USER_GROUP が親で、その配下に親ページのグループの別の子グループで GRNAT_USER_GROUP の子孫がある場合の親ページの duplicate
      {
        _id: pageIdForDuplicate11,
        path: '/np_PageForDuplicate6',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        revision: revisionIdForDuplicate9,
      },
      // ケース2-4: 親が public とか別の広い範囲の GRANT で、その配下に GRNAT_USER_GROUP の子孫がある場合の duplicate
      {
        _id: pageIdForDuplicate13,
        path: '/np_empty_PageForDuplicate7',
        grant: Page.GRANT_PUBLIC,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        _id: pageIdForDuplicate14,
        path: '/np_empty_PageForDuplicate7/np_child_PageForDuplicate7',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: pageIdForDuplicate13,
        revision: revisionIdForDuplicate11,
      },
      {
        _id: pageIdForDuplicate15,
        path: '/np_empty_PageForDuplicate7/np_child_PageForDuplicate7/np_grandchild_PageForDuplicate7',
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
        body: '/np_PageForDuplicate4',
        format: 'markdown',
        pageId: pageIdForDuplicate7,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate7,
        body: '/np_PageForDuplicate4/np_empty_PageForDuplicate4/np_grandchild_PageForDuplicate4',
        format: 'markdown',
        pageId: pageIdForDuplicate9,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate8,
        body: '/np_PageForDuplicate5',
        format: 'markdown',
        pageId: pageIdForDuplicate10,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate9,
        body: '/np_PageForDuplicate6',
        format: 'markdown',
        pageId: pageIdForDuplicate11,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate10,
        body: '/np_PageForDuplicate6',
        format: 'comment',
        pageId: pageIdForDuplicate12,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate11,
        body: '/np_child_PageForDuplicate7',
        format: 'markdown',
        pageId: pageIdForDuplicate14,
        author: dummyUser1,
      },
      {
        _id: revisionIdForDuplicate12,
        body: '/np_grandchild_PageForDuplicate7',
        format: 'markdown',
        pageId: pageIdForDuplicate15,
        author: dummyUser1,
      },
    ]);
    const tagForDuplicate1 = new mongoose.Types.ObjectId();
    const tagForDuplicate2 = new mongoose.Types.ObjectId();

    await Tag.insertMany([
      { _id: tagForDuplicate1, name: 'np_duplicate_Tag1' },
      { _id: tagForDuplicate2, name: 'np_duplicate_Tag2' },
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

    /**
     * Delete completely
     */

    /**
     * Revert
     */
  });

  describe('Rename', () => {
    test('dummy test to avoid test failure', async() => {
      // write test code
      expect(true).toBe(true);
    });
  });
  describe('Duplicate', () => {

    const duplicate = async(page, newPagePath, user, isRecursively) => {
      // mock return value
      const mockedDuplicateRecursivelyMainOperation = jest.spyOn(crowi.pageService, 'duplicateRecursivelyMainOperation').mockReturnValue(null);
      const mockedCreateAndSendNotifications = jest.spyOn(crowi.pageService, 'createAndSendNotifications').mockReturnValue(null);
      const duplicatedPage = await crowi.pageService.duplicate(page, newPagePath, user, isRecursively);

      // retrieve the arguments passed when calling method duplicateRecursivelyMainOperation inside duplicate method
      const argsForDuplicateRecursivelyMainOperation = mockedDuplicateRecursivelyMainOperation.mock.calls[0];

      // restores the original implementation
      mockedDuplicateRecursivelyMainOperation.mockRestore();
      mockedCreateAndSendNotifications.mockRestore();

      // duplicate descendants
      if (isRecursively) {
        await crowi.pageService.duplicateRecursivelyMainOperation(...argsForDuplicateRecursivelyMainOperation);
      }

      return duplicatedPage;
    };

    // public からコピペしただけなのでテストの処理は全部変える必要あり

    test('Should duplicate restricted single page', async() => {
      // ケース1-1: GRNAT_RESTRICTED 単一ページの duplicate
      const page = await Page.findOne({ path: '/np_PageForDuplicate1' });
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
      // ケース1-2: 子ページに GRANT_RESTRICTED がある場合の再帰的 duplicate
      const page = await Page.findOne({ path: '/np_PageForDuplicate2' });
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
      // ケース1-3: そこそこ上階層のパスに GRNAT_RESTRICTED があり、該当ページパスを含む子ページが存在する場合の、 GRNAT_RESTRICTED ページの duplicate
      const basePage = await Page.findOne({ path: '/np_PageForDuplicate3' });
      const revision = await Revision.findOne({ pageId: basePage._id });
      const childPage1 = await Page.findOne({ path: '/np_PageForDuplicate3/np_Child_1_ForDuplicate3' }).populate({ path: 'revision', model: 'Revision' });
      const childPage2 = await Page.findOne({ path: '/np_PageForDuplicate3/np_Child_2_ForDuplicate3' }).populate({ path: 'revision', model: 'Revision' });
      const revisionForChild1 = childPage1.revision;
      const revisionForChild2 = childPage2.revision;
      expectAllToBeTruthy([basePage, revision, childPage1, childPage2, revisionForChild1, revisionForChild2]);

      const newPagePath = '/duplicatedv5PageForDuplicate3';
      const duplicatedPage = await duplicate(basePage, newPagePath, dummyUser1, true);
      const duplicatedChildPage1 = await Page.findOne({ parent: duplicatedPage._id, path: '/duplicatedv5PageForDuplicate3/np_Child_1_ForDuplicate3' })
        .populate({ path: 'revision', model: 'Revision' });
      const duplicatedChildPage2 = await Page.findOne({ parent: duplicatedPage._id, path: '/duplicatedv5PageForDuplicate3/np_Child_2_ForDuplicate3' })
        .populate({ path: 'revision', model: 'Revision' });
      const revisionForDuplicatedPage = await Revision.findOne({ pageId: duplicatedPage._id });
      const revisionBodyForDupChild1 = duplicatedChildPage1.revision;
      const revisionBodyForDupChild2 = duplicatedChildPage2.revision;

      expectAllToBeTruthy([duplicatedPage, duplicatedChildPage1, duplicatedChildPage2,
                           revisionForDuplicatedPage, revisionBodyForDupChild1, revisionBodyForDupChild2]);
      expect(xssSpy).toHaveBeenCalled();
      expect(duplicatedPage.path).toBe(newPagePath);
      expect(duplicatedChildPage1.path).toBe('/duplicatedv5PageForDuplicate3/np_Child_1_ForDuplicate3');
      expect(duplicatedChildPage2.path).toBe('/duplicatedv5PageForDuplicate3/np_Child_2_ForDuplicate3');

    });

    test('Should duplicate multiple pages with empty child in it', async() => {
      // ケース2-1: GRNAT_USER_GROUP 単一ページの duplicate
      const basePage = await Page.findOne({ path: '/np_PageForDuplicate4' });
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
      expect(duplicatedChild.path).toBe('/duplicatedv5PageForDuplicate4/np_empty_PageForDuplicate4');
      expect(duplicatedGrandchild.path).toBe('/duplicatedv5PageForDuplicate4/np_empty_PageForDuplicate4/np_grandchild_PageForDuplicate4');
      expect(duplicatedChild.isEmpty).toBe(true);
      expect(duplicatedGrandchild.parent).toStrictEqual(duplicatedChild._id);
      expect(duplicatedChild.parent).toStrictEqual(duplicatedPage._id);

    });

    test('Should duplicate tags', async() => {
      // ケース2-2: GRNAT_USER_GROUP が親で、その配下に同じグループで GRNAT_USER_GROUP の子孫がある場合の親ページの duplicate
      const basePage = await Page.findOne({ path: '/np_PageForDuplicate5' });
      const tag1 = await Tag.findOne({ name: 'np_duplicate_Tag1' });
      const tag2 = await Tag.findOne({ name:  'np_duplicate_Tag2' });
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
      const basePage = await Page.findOne({ path: '/np_PageForDuplicate6' });
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
      // ケース2-3: GRNAT_USER_GROUP が親で、その配下に親ページのグループの別の子グループで GRNAT_USER_GROUP の子孫がある場合の親ページの duplicate
      const basePage = await Page.findOne({ path: '/np_empty_PageForDuplicate7' });
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
      expect(duplicatedChild.path).toBe('/duplicatedv5EmptyPageForDuplicate7/np_child_PageForDuplicate7');
      expect(duplicatedGrandchild.path).toBe('/duplicatedv5EmptyPageForDuplicate7/np_child_PageForDuplicate7/np_grandchild_PageForDuplicate7');
      expect(duplicatedGrandchild.parent).toStrictEqual(duplicatedChild._id);
      expect(duplicatedChild.parent).toStrictEqual(duplicatedPage._id);
    });
  });
  describe('Delete', () => {
    // test('', async() => {
    //   // write test code
    // });
  });
  describe('Delete completely', () => {
    // test('', async() => {
    //   // write test code
    // });
  });
  describe('revert', () => {
    // test('', async() => {
    //   // write test code
    // });
  });
});
