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
        { fromPath: '/org/path33', toPath: '/path3' },
      ]);
      expect(await PageRedirect.findOne({ fromPath: '/org/path1' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path2' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path3' })).not.toBeNull();
      expect(await PageRedirect.findOne({ fromPath: '/org/path33' })).not.toBeNull();

      // when:
      // remove all documents that have { toPath: '/path/3' }
      await PageRedirect.removePageRedirectByToPath('/path3');

      // then:
      const r1 = await PageRedirect.findOne({ fromPath: '/org/path1' });
      const r2 = await PageRedirect.findOne({ fromPath: '/org/path2' });
      const r3 = await PageRedirect.findOne({ fromPath: '/org/path3' });
      const r4 = await PageRedirect.findOne({ fromPath: '/org/path33' });
      expect(r1).not.toBeNull();
      expect(r2).not.toBeNull();
      expect(r3).toBeNull();
      expect(r4).toBeNull();
    });
  });

  describe('.retrievePageRedirectChains', () => {
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
