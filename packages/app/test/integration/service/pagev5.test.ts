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
  // parents
  let parentForRename1;
  let parentForRename2;
  let parentForRename3;
  let parentForRename4;
  let parentForRename5;
  // children
  let childForRename1;
  let childForRename2;
  let childForRename3;
  let childForRename4;
  let childForRename5;
  // Grandchild
  let grandchildForRename5;

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
    rootPage = await Page.create('/', 'body', dummyUser1._id, {});

    // Create Pages
    await Page.insertMany([
      // parents
      {
        path: '/parentForRename1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/parentForRename2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        isEmpty: true,
      },
      {
        path: '/parentForRename3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/parentForRename4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/parentForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      // children
      {
        path: '/childForRename1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/childForRename2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
      },
      {
        path: '/childForRename3',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        updatedAt: new Date('2021'),
      },
      {
        path: '/childForRename4',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        updatedAt: new Date('2021'),
      },
      {
        path: '/childForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: rootPage._id,
        updatedAt: new Date('2021'),
      },
    ]);

    // Find pages as Parent
    parentForRename1 = await Page.findOne({ path: '/parentForRename1' });
    parentForRename2 = await Page.findOne({ path: '/parentForRename2' });
    parentForRename3 = await Page.findOne({ path: '/parentForRename3' });
    parentForRename4 = await Page.findOne({ path: '/parentForRename4' });
    parentForRename5 = await Page.findOne({ path: '/parentForRename5' });
    // Find pages as Child
    childForRename1 = await Page.findOne({ path: '/childForRename1' });
    childForRename2 = await Page.findOne({ path: '/childForRename2' });
    childForRename3 = await Page.findOne({ path: '/childForRename3' });
    childForRename4 = await Page.findOne({ path: '/childForRename4' });
    childForRename5 = await Page.findOne({ path: '/childForRename5' });

    // create grandchild
    await Page.insertMany([
      // Grandchild
      {
        path: '/childForRename5/grandchildForRename5',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1._id,
        parent: childForRename5._id,
        updatedAt: new Date('2021'),
      },
    ]);

  });


  const safeRename = async(page, newPagePath, user, options) => {

    // mock return value
    const mockedResumableRenameDescendants = jest.spyOn(crowi.pageService, 'resumableRenameDescendants')
      .mockReturnValue(null);
    jest.spyOn(crowi.pageService, 'createAndSendNotifications')
      .mockReturnValue(null);
    const renamedPage = await crowi.pageService.renamePage(page, newPagePath, user, options);

    // retrieve the arguments passed when calling method resumableRenameDescendants inside renamePage method
    const argsForCreateAndSendNotifications = mockedResumableRenameDescendants.mock.calls[0];
    // restores the original implementation
    mockedResumableRenameDescendants.mockRestore();

    // rename descendants
    await crowi.pageService.resumableRenameDescendants(...argsForCreateAndSendNotifications);

    return renamedPage;
  };


  describe('Rename', () => {
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

    test('Should move to under non-empty page', async() => {

      // rename target page
      const newPath = '/parentForRename1/renamed1';
      const renamedPage = await safeRename(childForRename1, newPath, dummyUser1, {});

      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentForRename1._id);

    });

    test('Should move to under empty page', async() => {
      // rename target page
      const newPath = '/parentForRename2/renamed2';
      const renamedPage = await safeRename(childForRename2, newPath, dummyUser1, {});

      expect(renamedPage.path).toBe(newPath);
      expect(parentForRename2.isEmpty).toBe(true);
      expect(renamedPage.parent).toStrictEqual(parentForRename2._id);
    });

    test('Should move with option updateMetadata: true', async() => {
      // rename target page
      const newPath = '/parentForRename3/renamed3';
      const oldUdpateAt = childForRename3.updatedAt;
      const renamedPage = await safeRename(childForRename3, newPath, dummyUser2, { updateMetadata: true });

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
    //   const newPath = '/parentForRename4/renamed4';
    //   const renamedPage = await safeRename(childForRename4, newPath, dummyUser2, { createRedirectPage: true });
    //   const pageRedirect = await PageRedirect.find({ fromPath: childForRename4.path, toPath: renamedPage.path });

    //   expect(renamedPage.path).toBe(newPath);
    //   expect(renamedPage.parent).toStrictEqual(parentForRename4._id);
    //   expect(pageRedirect.length).toBeGreaterThan(0);
    // });

    test('Should move descendants', async() => {
      // rename target page
      const newPath = '/parentForRename5/renamed5';
      const renamedPage = await safeRename(childForRename5, newPath, dummyUser1, {});
      const grandchildren = await Page.find({ parent: renamedPage._id });
      const grandchild = grandchildren[0];

      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentForRename5._id);
      expect(grandchild.parent).toStrictEqual(renamedPage._id);
      expect(grandchild.path).toBe('/parentForRename5/renamed5/grandchildForRename5');
    });
  });
});

describe('PageService page operations with non-public pages', () => {
  // TODO: write test code
});
