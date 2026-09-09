import type { IUser } from '@growi/core';
import expressFactory, { type Express } from 'express';
import mongoose, { type HydratedDocument, type Model } from 'mongoose';
import request from 'supertest';

import { getInstance } from '^/test/setup/crowi';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type Crowi from '~/server/crowi';
import type { PageDocument, PageModel } from '~/server/models/page';
import { configManager } from '~/server/service/config-manager';
import { prisma } from '~/utils/prisma';

/**
 * Route-level integration test for Task 5.3: the $lsx `tag` option must
 * reach the REAL production wiring in `crowi/index.ts` --
 * `lsxRoutes(this, this.express, { resolveTagPageIds: (tagNames) =>
 * prisma.pagetagrelations.findPageIdsWithAllTags(tagNames) })` -- and the
 * resulting `/_api/lsx` route must apply both the tag condition AND the
 * existing viewer/permission filter together.
 *
 * Approach: build a real `Crowi` instance (via the shared `getInstance()`
 * test helper, same as page-markdown.integ.ts) and call its OWN
 * `setupRoutesForPlugins()` method -- this is the exact method under
 * change for this task -- against a real Express app. Nothing about the
 * lsx route registration is reimplemented here; the only thing this file
 * adds is a real MongoDB Page/Tag/PageTagRelation fixture, a `req.user`
 * injector (standing in for session/PAT resolution, same convention as
 * other route-level integ tests here), and HTTP requests via supertest.
 */

const WORKER_ID = process.env.VITEST_WORKER_ID ?? '1';
const TAG_PREFIX = `lsx-wiring-${WORKER_ID}-`;
const TAG_NAME = `${TAG_PREFIX}tag`;
const BASE_PATH = `/lsx-wiring-${WORKER_ID}`;

describe('crowi.setupRoutesForPlugins() -> $lsx tag wiring (integration)', () => {
  let crowi: Crowi;
  let app: Express;
  let Page: PageModel;
  let User: Model<IUser>;

  let testUser: HydratedDocument<IUser>;
  let otherUser: HydratedDocument<IUser>;
  let currentUser: HydratedDocument<IUser> | undefined;

  let visiblePageId: string;
  let hiddenPageId: string;
  let tagId: string;

  const createdPageIds: string[] = [];

  let originalCrowiExpress: Express | undefined;

  beforeAll(async () => {
    crowi = await getInstance();

    Page = mongoose.model<PageDocument, PageModel>('Page');
    User = mongoose.model<IUser>('User');

    const testUserName = `lsx-wiring-user-${WORKER_ID}`;
    const otherUserName = `lsx-wiring-other-${WORKER_ID}`;
    await User.deleteMany({ username: { $in: [testUserName, otherUserName] } });
    testUser = await User.create({
      name: testUserName,
      username: testUserName,
      email: `${testUserName}@example.com`,
    });
    otherUser = await User.create({
      name: otherUserName,
      username: otherUserName,
      email: `${otherUserName}@example.com`,
    });

    await Page.deleteMany({ path: { $regex: `^${BASE_PATH}` } });

    // one page the current viewer (testUser) CAN see, one they CANNOT --
    // both tagged with the same tag, so the only thing that can explain a
    // difference in the response is the viewer-permission filter.
    const visiblePage = await Page.create({
      path: `${BASE_PATH}/visible`,
      grant: Page.GRANT_PUBLIC,
      creator: testUser._id,
      lastUpdateUser: testUser._id,
      isEmpty: false,
      descendantCount: 0,
    });
    const hiddenPage = await Page.create({
      path: `${BASE_PATH}/hidden`,
      grant: Page.GRANT_OWNER,
      grantedUsers: [otherUser._id],
      creator: otherUser._id,
      lastUpdateUser: otherUser._id,
      isEmpty: false,
      descendantCount: 0,
    });
    visiblePageId = visiblePage._id.toString();
    hiddenPageId = hiddenPage._id.toString();
    createdPageIds.push(visiblePageId, hiddenPageId);

    await prisma.pagetagrelations.deleteMany({
      where: { relatedPageId: { in: createdPageIds } },
    });
    await prisma.tags.deleteMany({ where: { name: TAG_NAME } });
    await prisma.tags.create({ data: { name: TAG_NAME } });
    const tag = await prisma.tags.findFirst({ where: { name: TAG_NAME } });
    if (tag == null) {
      throw new Error('failed to seed the fixture tag');
    }
    tagId = tag.id;
    await prisma.pagetagrelations.createMany({
      data: createdPageIds.map((relatedPageId) => ({
        relatedPageId,
        relatedTagId: tagId,
      })),
    });

    // Build a fresh Express app and delegate route registration to the
    // REAL production method under test -- crowi/index.ts's
    // setupRoutesForPlugins(). This is deliberately NOT a hand-rolled call
    // to `lsxRoutes(...)`: that would bypass the very wiring this task adds.
    app = expressFactory();
    app.use(expressFactory.json());
    app.use((req: CrowiRequest, _res, next) => {
      if (currentUser != null) {
        req.user = currentUser;
      }
      next();
    });
    // Capture the Crowi singleton's original `express` before overwriting it --
    // `getInstance()` returns the SAME Crowi instance to every `.integ.ts` file
    // sharing this Vitest worker for the life of the worker, so this mutation
    // must be restored in `afterAll` (mirrors the
    // `security:list-policy:hideRestrictedByOwner` capture/restore below).
    originalCrowiExpress = crowi.express;
    crowi.express = app;
    crowi.setupRoutesForPlugins();

    // By default GROWI's list views show the EXISTENCE of a GRANT_OWNER
    // page to any viewer (only its content stays hidden) -- see
    // `security:list-policy:hideRestrictedByOwner` (default false). Turning
    // it on is what makes an owner-restricted page actually disappear from
    // a listing for a non-owner, which is what this test needs to prove the
    // tag condition and the viewer-permission filter compose together
    // (same override used by bookmarks.integ.ts for the same reason).
    await configManager.updateConfig(
      'security:list-policy:hideRestrictedByOwner',
      true,
      { skipPubsub: true },
    );
  }, 60_000);

  afterAll(async () => {
    try {
      await Page.deleteMany({ _id: { $in: createdPageIds } });
    } catch {
      // ignore
    }
    try {
      await prisma.pagetagrelations.deleteMany({
        where: { relatedPageId: { in: createdPageIds } },
      });
      await prisma.tags.deleteMany({ where: { name: TAG_NAME } });
    } catch {
      // ignore
    }
    try {
      await User.deleteMany({ _id: { $in: [testUser?._id, otherUser?._id] } });
    } catch {
      // ignore
    }
    try {
      await configManager.updateConfig(
        'security:list-policy:hideRestrictedByOwner',
        false,
        { skipPubsub: true },
      );
    } catch {
      // ignore
    }
    // `Crowi#express` is declared `express!: Express` (definite-assignment
    // assertion), so its declared type lies about nullability -- at this point
    // in the test lifecycle it is genuinely `Express | undefined`. Cast (not
    // `as any`) to restore the real captured value onto that field.
    crowi.express = originalCrowiExpress as Express;
  }, 30_000);

  beforeEach(() => {
    currentUser = testUser;
  });

  it('resolves the tag through the real production resolver end-to-end, and stays compatible with the existing viewer-permission filter (Req 1.1, 1.2, 1.3; supporting evidence for 3.1, 3.2 -- see task 6.1 for dedicated depth)', async () => {
    const res = await request(app)
      .get('/_api/lsx')
      .query({
        pagePath: BASE_PATH,
        options: JSON.stringify({ tag: TAG_NAME }),
      });

    expect(res.status).toBe(200);
    const paths = res.body.pages.map((p: { path: string }) => p.path);

    // the tagged page testUser can view is included
    expect(paths).toContain(`${BASE_PATH}/visible`);
    // the tagged page testUser cannot view is excluded, even though it
    // matches the tag condition
    expect(paths).not.toContain(`${BASE_PATH}/hidden`);
    expect(res.body.total).toBe(1);

    // Positive control: the SAME hidden page, under the SAME tag condition,
    // DOES appear for otherUser -- the user it was granted to. This isolates
    // the exclusion above to the viewer-permission filter specifically,
    // rather than some incidental fixture detail (e.g. the page being
    // unlisted for everyone, or the tag relation not actually covering it).
    currentUser = otherUser;
    const resAsOwner = await request(app)
      .get('/_api/lsx')
      .query({
        pagePath: BASE_PATH,
        options: JSON.stringify({ tag: TAG_NAME }),
      });

    expect(resAsOwner.status).toBe(200);
    const pathsAsOwner = resAsOwner.body.pages.map(
      (p: { path: string }) => p.path,
    );
    expect(pathsAsOwner).toContain(`${BASE_PATH}/hidden`);
    expect(pathsAsOwner).toContain(`${BASE_PATH}/visible`);
    expect(resAsOwner.body.total).toBe(2);
  });

  it('returns an empty list for a tag name that does not exist on the wiki (Req 1.4, 1.5)', async () => {
    const res = await request(app)
      .get('/_api/lsx')
      .query({
        pagePath: BASE_PATH,
        options: JSON.stringify({ tag: `${TAG_PREFIX}does-not-exist` }),
      });

    expect(res.status).toBe(200);
    expect(res.body.pages).toEqual([]);
    expect(res.body.total).toBe(0);
  });
});
