import mongoose from 'mongoose';

import { IPageRedirect, PageRedirectModel } from '../../../src/server/models/page-redirect';
import { getInstance } from '../setup-crowi';

describe('PageRedirect', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let PageRedirect;

  beforeAll(async() => {
    crowi = await getInstance();

    PageRedirect = mongoose.model('PageRedirect');
  });

  describe('.removePageRedirectByToPath', () => {
    test('works fine', async() => {
      // setup:
      await PageRedirect.insertMany([
        { fromPath: '/org/path1', toPath: '/path1' },
        { fromPath: '/org/path2', toPath: '/path2' },
        { fromPath: '/org/path3', toPath: '/path3' },
        { fromPath: '/org/path33', toPath: '/org/path333' },
        { fromPath: '/org/path333', toPath: '/path3' },
      ]);
      expect(await PageRedirect.findOne({ fromPath: '/org/path1' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path2' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path3' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path33' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path333' })).not.toBeNull();

      // when:
      // remove all documents that have { toPath: '/path/3' }
      await PageRedirect.removePageRedirectByToPath('/path3');

      // then:
      expect(await PageRedirect.findOne({ fromPath: '/org/path1' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path2' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path3' })).toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path33' })).toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path333' })).toBeNull();
    });
  });

  describe('.retrievePageRedirectChains', () => {
    test('shoud return null when data is not found', async() => {
      // setup:
      expect(await PageRedirect.findOne({ fromPath: '/path1' })).toBeNull();

      // when:
      // retrieve
      const chains = await PageRedirect.retrievePageRedirectChains('/path1');

      // then:
      expect(chains).toBeNull();
    });

    test('shoud return IPageRedirectChains', async() => {
      // setup:
      await PageRedirect.insertMany([
        { fromPath: '/path1', toPath: '/path2' },
        { fromPath: '/path2', toPath: '/path3' },
        { fromPath: '/path3', toPath: '/path4' },
      ]);
      expect(await PageRedirect.findOne({ fromPath: '/path1' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/path2' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/path3' })).not.toBeNull();

      // when:
      // retrieve
      const chains = await PageRedirect.retrievePageRedirectChains('/path1');

      // then:
      expect(chains).not.toBeNull();
      expect(chains.start).not.toBeNull();
      expect(chains.start.fromPath).toEqual('/path1');
      expect(chains.start.toPath).toEqual('/path2');
      expect(chains.end).not.toBeNull();
      expect(chains.end.fromPath).toEqual('/path3');
      expect(chains.end.toPath).toEqual('/path4');
    });
  });

});
