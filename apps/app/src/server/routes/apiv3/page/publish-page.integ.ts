/**
 * Security regression test — a read-only user must not be able to publish
 * (unset the WIP flag on) a page through this endpoint.
 *
 * Root cause: unlike update-page.ts, this route's middleware chain omitted
 * `excludeReadOnlyUser` (compare `loginRequiredStrictly, ...validator` here
 * with `loginRequiredStrictly, excludeReadOnlyUser, addActivity, ...validator`
 * on update-page.ts). `Page.findByIdAndViewer`, used by the terminal handler,
 * only checks view permission -- it has no notion of edit permission -- so a
 * logged-in read-only user who knows a pageId could call this endpoint
 * directly and flip its WIP flag.
 *
 * This test drives the REAL middleware array returned by
 * `publishPageHandlersFactory` (not just the terminal handler), because the
 * bug is about which middleware is present in the chain, not about the
 * terminal handler's own logic.
 *
 * Requires a real MongoDB (wired by vitest.workspace.mts integ setup).
 */

import type { IUserHasId } from '@growi/core';
import type { RequestHandler } from 'express';
import mongoose, { Types } from 'mongoose';

import { getInstance } from '^/test/setup/crowi';

import type Crowi from '~/server/crowi';
import type { PageModel } from '~/server/models/page';

import type { ApiV3Response } from '../interfaces/apiv3-response';
import { publishPageHandlersFactory } from './publish-page';

const TEST_USERNAME = 'publish-page-integ-readonly-user';

/** Run the handler array as Express would, stopping at the first middleware
 * that does not call `next()` (i.e. the one that sent a response). */
async function runMiddlewareChain(
  handlers: RequestHandler[],
  // biome-ignore lint/suspicious/noExplicitAny: minimal Express request shape
  req: any,
  res: ApiV3Response,
): Promise<void> {
  for (const handler of handlers) {
    let nextCalled = false;
    // biome-ignore lint/performance/noAwaitInLoops: middlewares must run sequentially, in Express's own order
    // biome-ignore lint/suspicious/noExplicitAny: express-validator chains and handlers have varying signatures
    await (handler as any)(req, res, () => {
      nextCalled = true;
    });
    if (!nextCalled) {
      return;
    }
  }
}

describe('publish-page — a read-only user must not be able to publish a page', () => {
  let crowi: Crowi;
  let readOnlyUser: IUserHasId;

  beforeAll(async () => {
    crowi = await getInstance();

    readOnlyUser = await crowi.models.User.create({
      name: 'Publish Page Integ Read Only User',
      username: TEST_USERNAME,
      email: 'publish-page-integ-readonly@example.com',
      readOnly: true,
    });
  }, 120_000);

  afterAll(async () => {
    await crowi.models.User.deleteMany({ username: TEST_USERNAME });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects the request and never publishes the page', async () => {
    const pageId = new Types.ObjectId();

    const Page = mongoose.model<unknown, PageModel>('Page');
    const publishSpy = vi.fn();
    const fakePage = {
      _id: pageId,
      path: '/publish-page-integ-target',
      publish: publishSpy,
      save: vi.fn().mockResolvedValue(undefined),
    };
    const findByIdAndViewerSpy = vi
      .spyOn(Page, 'findByIdAndViewer')
      // biome-ignore lint/suspicious/noExplicitAny: minimal stub for the viewer lookup
      .mockResolvedValue(fakePage as any);

    const req = {
      params: { pageId: pageId.toString() },
      query: {},
      body: {},
      headers: {},
      user: readOnlyUser,
    };

    const apiv3 = vi.fn();
    const apiv3Err = vi.fn();
    const res = {
      apiv3,
      apiv3Err,
      // biome-ignore lint/suspicious/noExplicitAny: minimal ApiV3Response stub
    } as any as ApiV3Response;

    const handlers = publishPageHandlersFactory(crowi);
    await runMiddlewareChain(handlers, req, res);

    // The read-only user must be rejected with an error response...
    expect(apiv3Err).toHaveBeenCalled();
    expect(apiv3).not.toHaveBeenCalled();

    // ...and the page must never actually be published.
    expect(findByIdAndViewerSpy).not.toHaveBeenCalled();
    expect(publishSpy).not.toHaveBeenCalled();
  });
});
