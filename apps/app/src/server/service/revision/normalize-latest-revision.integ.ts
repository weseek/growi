import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

import type { PageDocument, PageModel } from '~/server/models/page';
// eslint-disable-next-line import/no-named-as-default
import PageModelFactory from '~/server/models/page';
import { Revision } from '~/server/models/revision';

import { normalizeLatestRevision } from './normalize-latest-revision';

describe('normalizeLatestRevision', () => {

  beforeAll(async() => {
    await PageModelFactory(null);
  });


  test('returns without any operation if the page has revisions', async() => {
    // Arrange
    const Page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');

    const page = await Page.create({ path: '/foo' });
    await Revision.create({ pageId: page._id, body: '' });
    // spy
    const updateOneSpy = vi.spyOn(Revision, 'updateOne');

    // Act
    await normalizeLatestRevision(page._id);

    // Assert
    expect(updateOneSpy).not.toHaveBeenCalled();
  });

});
