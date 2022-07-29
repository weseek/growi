import mongoose from 'mongoose';

import { IPageRedirect, PageRedirectModel } from '../../../src/server/models/page-redirect';
import { getInstance } from '../setup-crowi';

describe('PageRedirect', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let PageRedirect;

  let redirect1;
  let redirect2;
  let redirect3;

  beforeAll(async() => {
    crowi = await getInstance();

    PageRedirect = mongoose.model('PageRedirect');

    await PageRedirect.insertMany([
      { fromPath: '/org/path1', toPath: '/path1' },
      { fromPath: '/org/path2', toPath: '/path2' },
      { fromPath: '/org/path3', toPath: '/path3' },
    ]);

    redirect1 = await PageRedirect.findOne({ fromPath: '/org/path1' });
    redirect2 = await PageRedirect.findOne({ fromPath: '/org/path2' });
    redirect3 = await PageRedirect.findOne({ fromPath: '/org/path3' });
  });

  describe('.removePageRedirectByToPath', () => {
    test('works fine', async() => {
      expect(redirect1).not.toBeNull();
      expect(redirect2).not.toBeNull();
      expect(redirect3).not.toBeNull();

      // add document for this test
      await PageRedirect.insertMany([
        { fromPath: '/org/path33', toPath: '/path3' },
      ]);
      expect(await PageRedirect.findOne({ fromPath: '/org/path33' })).not.toBeNull();

      // remove all documents that have { toPath: '/path/3' }
      await PageRedirect.removePageRedirectByToPath('/path3');

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

});
