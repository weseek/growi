import type { HydratedDocument } from 'mongoose';
import mongoose, { Types } from 'mongoose';

import type { PageDocument, PageModel } from '~/server/models/page';
// eslint-disable-next-line import/no-named-as-default
import PageModelFactory from '~/server/models/page';
import { Revision } from '~/server/models/revision';

import { normalizeLatestRevision } from './normalize-latest-revision';

describe('normalizeLatestRevision returns without any operation', () => {

  beforeAll(async() => {
    await PageModelFactory(null);
  });


  test('when the page has revisions', async() => {
    const Page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');

    // Arrange
    const page = await Page.create({ path: '/foo' });
    await Revision.create({ pageId: page._id, body: '' });
    // spy
    const updateOneSpy = vi.spyOn(Revision, 'updateOne');

    // Act
    await normalizeLatestRevision(page._id);

    // Assert
    expect(updateOneSpy).not.toHaveBeenCalled();
  });

  test('when the page is not found', async() => {
    // Arrange
    const pageIdOfRevision = new Types.ObjectId();
    // create an orphan revision
    await Revision.create({ pageId: pageIdOfRevision, body: '' });

    // spy
    const updateOneSpy = vi.spyOn(Revision, 'updateOne');

    // Act
    await normalizeLatestRevision(pageIdOfRevision);

    // Assert
    expect(updateOneSpy).not.toHaveBeenCalled();
  });

  test('when the page.revision is null', async() => {
    const Page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');

    // Arrange
    const page = await Page.create({ path: '/foo' });
    // create an orphan revision
    await Revision.create({ pageId: page._id, body: '' });

    // spy
    const updateOneSpy = vi.spyOn(Revision, 'updateOne');

    // Act
    await normalizeLatestRevision(page._id);

    // Assert
    expect(updateOneSpy).not.toHaveBeenCalled();
  });

  test('when the page.revision does not exist', async() => {
    const Page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');

    // Arrange
    const revisionNonExistent = new Types.ObjectId();
    const page = await Page.create({ path: '/foo', revision: revisionNonExistent });
    // create an orphan revision
    await Revision.create({ pageId: page._id, body: '' });

    // spy
    const updateOneSpy = vi.spyOn(Revision, 'updateOne');

    // Act
    await normalizeLatestRevision(page._id);

    // Assert
    expect(updateOneSpy).not.toHaveBeenCalled();
  });

});
