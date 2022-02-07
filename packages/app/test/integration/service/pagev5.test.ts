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

    await Page.insertMany([
      {
        path: '/level1/level2/level2',
        grant: Page.GRANT_PUBLIC,
        creator: dummyUser1,
        lastUpdateUser: dummyUser1,
      },
    ]);

  });

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
