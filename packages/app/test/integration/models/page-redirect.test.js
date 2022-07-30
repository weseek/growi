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

  beforeEach(async() => {
    // clear collection
    await PageRedirect.deleteMany({});
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

  describe('.retrievePageRedirectEndpoints', () => {
    test('shoud return null when data is not found', async() => {
      // setup:
      expect(await PageRedirect.findOne({ fromPath: '/path1' })).toBeNull();

      // when:
      // retrieve
      const endpoints = await PageRedirect.retrievePageRedirectEndpoints('/path1');

      // then:
      expect(endpoints).toBeNull();
    });

    test('shoud return IPageRedirectEnds (start and end is the same)', async() => {
      // setup:
      await PageRedirect.insertMany([
        { fromPath: '/path1', toPath: '/path2' },
      ]);
      expect(await PageRedirect.findOne({ fromPath: '/path1' })).not.toBeNull();

      // when:
      // retrieve
      const endpoints = await PageRedirect.retrievePageRedirectEndpoints('/path1');

      // then:
      expect(endpoints).not.toBeNull();
      expect(endpoints.start).not.toBeNull();
      expect(endpoints.start.fromPath).toEqual('/path1');
      expect(endpoints.start.toPath).toEqual('/path2');
      expect(endpoints.end).not.toBeNull();
      expect(endpoints.end.fromPath).toEqual('/path1');
      expect(endpoints.end.toPath).toEqual('/path2');
    });

    test('shoud return IPageRedirectEnds', async() => {
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
      const endpoints = await PageRedirect.retrievePageRedirectEndpoints('/path1');

      // then:
      expect(endpoints).not.toBeNull();
      expect(endpoints.start).not.toBeNull();
      expect(endpoints.start.fromPath).toEqual('/path1');
      expect(endpoints.start.toPath).toEqual('/path2');
      expect(endpoints.end).not.toBeNull();
      expect(endpoints.end.fromPath).toEqual('/path3');
      expect(endpoints.end.toPath).toEqual('/path4');
    });
  });

});
