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
  let xssSpy;

  let rootPage;
  // parents
  let parentForRename1;
  // children
  let childForRename1;
  // revisions ids
  let revisionIdOfParentForRename1;
  let revisionIdOfChildForRename1;
  // revisions
  let revisionOfParentForRename1;
  let revisionOfChildForRename1;

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

    // RevisionIds
    revisionIdOfParentForRename1 = new mongoose.Types.ObjectId();
    revisionIdOfChildForRename1 = new mongoose.Types.ObjectId();

    // Create Pages
    await Page.insertMany([
      // parents
      {
        path: '/parentForRename1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1,
        revision: revisionIdOfParentForRename1,
        parent: rootPage._id,
        updatedAt: new Date(),
      },
      // children
      {
        path: '/childForRename1',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1,
        revision: revisionIdOfChildForRename1,
        parent: rootPage._id,
      },
    ]);

    // Find pages
    parentForRename1 = await Page.findOne({ path: '/parentForRename1' });
    childForRename1 = await Page.findOne({ path: '/childForRename1' });

    // Create Revisions
    await Revision.insertMany([
      // parents
      {
        _id: revisionIdOfParentForRename1,
        pageId: parentForRename1._id,
        body: 'body_for_parentForRename1',
        author: dummyUser1._id,
      },
      // children
      {
        _id: revisionIdOfChildForRename1,
        pageId: childForRename1._id,
        body: 'body_for_parentForRename1',
        author: dummyUser1._id,
      },
    ]);

    // Find Revisions
    revisionOfParentForRename1 = await Revision.findOne({ _id: revisionIdOfParentForRename1 });
    revisionOfChildForRename1 = await Revision.findOne({ _id: revisionIdOfChildForRename1 });

  });


  const safeRename = async(renameArg) => {
    const {
      page, newPagePath, user, options,
    } = renameArg;
    // mock
    const mockedRenameDescendantsWithStream = jest.spyOn(crowi.pageService, 'renameDescendantsWithStream')
      .mockReturnValue(null);
    jest.spyOn(crowi.pageService, 'createAndSendNotifications')
      .mockReturnValue(null);

    const renamedPage = await crowi.pageService.renamePage(page, newPagePath, user, options);

    // retrieve arugemtns which method:'renameDescendantsWithStream' was called with
    const argsForCreateAndSendNotifications = mockedRenameDescendantsWithStream.mock.calls[0];
    // restore the mock to the original function
    mockedRenameDescendantsWithStream.mockRestore();

    // rename descendants
    await crowi.pageService.renameDescendantsWithStream(...argsForCreateAndSendNotifications);

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
      const renameArg = {
        page: childForRename1,
        newPagePath: newPath,
        user: dummyUser1,
        options: {},
      };
      const renamedPage = await safeRename(renameArg);

      expect(renamedPage.path).toBe(newPath);
      expect(renamedPage.parent).toStrictEqual(parentForRename1._id);

    });

    test('Should move to under empty page', async() => {
      // a
    });

    test('Should move with option updateMetadata: true', async() => {
      // a
    });

    test('Should move with option createRedirectPage: true', async() => {
      // a
    });
  });
});

describe('PageService page operations with non-public pages', () => {
  // TODO: write test code
});
