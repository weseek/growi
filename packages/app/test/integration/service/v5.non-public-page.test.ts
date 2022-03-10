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

    const npDummyUserId1 = new mongoose.Types.ObjectId();
    const npDummyUserId2 = new mongoose.Types.ObjectId();
    const npDummyUserId3 = new mongoose.Types.ObjectId();
    await User.insertMany([
      {
        _id: npDummyUserId1, name: 'npDummyUser1', username: 'npDummyUser1', email: 'npDummyUser1@example.com',
      },
      {
        _id: npDummyUserId2, name: 'npDummyUser2', username: 'npDummyUser2', email: 'npDummyUser2@example.com',
      },
      {
        _id: npDummyUserId3, name: 'npDummyUser3', username: 'npDummyUser3', email: 'npDummyUser3@example.com',
      },
    ]);

    const dummyGroupIdIsolate = new mongoose.Types.ObjectId();
    const dummyGroupIdA = new mongoose.Types.ObjectId();
    const dummyGroupIdB = new mongoose.Types.ObjectId();
    const dummyGroupIdC = new mongoose.Types.ObjectId();

    await UserGroup.insertMany([
      {
        _id: dummyGroupIdIsolate,
        name: 'np_groupIsolate',
      },
      {
        _id: dummyGroupIdA,
        name: 'np_groupA',
      },
      {
        _id: dummyGroupIdB,
        name: 'np_groupB',
        parent: dummyGroupIdA,
      },
      {
        _id: dummyGroupIdC,
        name: 'np_groupC',
        parent: dummyGroupIdB,
      },
    ]);

    await UserGroupRelation.insertMany([
      {
        relatedGroup: dummyGroupIdIsolate,
        relatedUser: npDummyUserId1,
        createdAt: new Date(),
      },
      {
        relatedGroup: dummyGroupIdIsolate,
        relatedUser: npDummyUserId2,
        createdAt: new Date(),
      },
      {
        relatedGroup: dummyGroupIdA,
        relatedUser: npDummyUserId1,
        createdAt: new Date(),
      },
      {
        relatedGroup: dummyGroupIdA,
        relatedUser: npDummyUserId2,
        createdAt: new Date(),
      },
      {
        relatedGroup: dummyGroupIdA,
        relatedUser: npDummyUserId3,
        createdAt: new Date(),
      },
      {
        relatedGroup: dummyGroupIdB,
        relatedUser: npDummyUserId2,
        createdAt: new Date(),
      },
      {
        relatedGroup: dummyGroupIdB,
        relatedUser: npDummyUserId3,
        createdAt: new Date(),
      },
      {
        relatedGroup: dummyGroupIdC,
        relatedUser: npDummyUserId3,
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
