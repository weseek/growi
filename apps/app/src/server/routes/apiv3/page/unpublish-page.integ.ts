/**
 * Security regression test — a read-only user must not be able to unpublish
 * (set the WIP flag on) a page through this endpoint.
 *
 * Same root cause as publish-page.integ.ts: this route's middleware chain
 * omitted `excludeReadOnlyUser`, and `Page.findByIdAndViewer` (used by the
 * terminal handler) only checks view permission, not edit permission.
 *
 * This test drives the REAL middleware array returned by
 * `unpublishPageHandlersFactory` (not just the terminal handler), because the
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
import { unpublishPageHandlersFactory } from './unpublish-page';

const TEST_USERNAME = 'unpublish-page-integ-readonly-user';

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

describe('unpublish-page — a read-only user must not be able to unpublish a page', () => {
  let crowi: Crowi;
  let readOnlyUser: IUserHasId;

  beforeAll(async () => {
    crowi = await getInstance();

    readOnlyUser = await crowi.models.User.create({
      name: 'Unpublish Page Integ Read Only User',
      username: TEST_USERNAME,
      email: 'unpublish-page-integ-readonly@example.com',
      readOnly: true,
    });
  }, 120_000);

  afterAll(async () => {
    await crowi.models.User.deleteMany({ username: TEST_USERNAME });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects the request and never unpublishes the page', async () => {
    const pageId = new Types.ObjectId();

    const Page = mongoose.model<unknown, PageModel>('Page');
    const unpublishSpy = vi.fn();
    const fakePage = {
      _id: pageId,
      path: '/unpublish-page-integ-target',
      unpublish: unpublishSpy,
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

    const handlers = unpublishPageHandlersFactory(crowi);
    await runMiddlewareChain(handlers, req, res);

    // The read-only user must be rejected with an error response...
    expect(apiv3Err).toHaveBeenCalled();
    expect(apiv3).not.toHaveBeenCalled();

    // ...and the page must never actually be unpublished.
    expect(findByIdAndViewerSpy).not.toHaveBeenCalled();
    expect(unpublishSpy).not.toHaveBeenCalled();
  });
});
