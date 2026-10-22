/**
 * Routing integration test for the comment list and single-comment routes,
 * mounted at the same paths and with the same method as
 * apps/app/src/server/routes/apiv3/index.js.
 *
 * The apiv3 index module cannot be imported under vitest, so the mount is
 * mirrored here and a drift guard reads index.js to keep the mirror honest.
 *
 * Requirements: 3.8, 4.1 (comment spec); 11.2 (comment-reactions spec)
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { Types } from 'mongoose';
import request from 'supertest';

import { getInstance } from '^/test/setup/crowi';

import addCustomFunctionToResponse from '~/server/routes/apiv3/response';

import { getCommentRouteHandlersFactory } from './get';
import { listCommentsRouteHandlersFactory } from './list';

const MOUNT_PREFIX = '/_api/v3/comments';

describe('comment route registration', () => {
  let app: express.Application;

  beforeAll(async () => {
    const crowi = await getInstance();

    const responseHelpers: { response: Record<string, unknown> } = {
      response: {},
    };
    addCustomFunctionToResponse(responseHelpers);

    app = express();
    app.use(express.json());
    app.use((_req, res, next) => {
      Object.assign(res, responseHelpers.response);
      next();
    });

    const commentsRouter = express.Router();
    commentsRouter.get('/', listCommentsRouteHandlersFactory(crowi));
    commentsRouter.get('/:id', getCommentRouteHandlersFactory(crowi));
    app.use(MOUNT_PREFIX, commentsRouter);
  }, 120_000);

  it('serves GET /comments through the real middleware chain (anonymous callers get 403, not 404)', async () => {
    const res = await request(app)
      .get(MOUNT_PREFIX)
      .query({ pageId: String(new Types.ObjectId()) });
    expect(res.status).toBe(403);
  });

  it('serves GET /comments/:id through the real middleware chain (anonymous callers get 403, not 404)', async () => {
    const res = await request(app)
      .get(`${MOUNT_PREFIX}/${String(new Types.ObjectId())}`)
      .query({ pageId: String(new Types.ObjectId()) });
    expect(res.status).toBe(403);
  });

  it.each([
    ['POST', () => request(app).post(MOUNT_PREFIX).send({})],
    ['PUT', () => request(app).put(MOUNT_PREFIX).send({})],
    ['DELETE', () => request(app).delete(MOUNT_PREFIX)],
  ])('does not serve %s /comments', async (_method, send) => {
    const res = await send();
    expect(res.status).toBe(404);
  });

  it('is registered in the production apiv3 router as read-only GETs at /comments and /comments/:id', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../../../../server/routes/apiv3/index.js'),
      'utf8',
    );
    expect(source).toContain("router.use('/comments', commentsRouter)");
    expect(source).toContain(
      "commentsRouter.get('/', listCommentsRouteHandlersFactory(crowi))",
    );
    expect(source).toContain(
      "commentsRouter.get('/:id', getCommentRouteHandlersFactory(crowi))",
    );
    expect(source).not.toMatch(/commentsRouter\.(post|put|patch|delete)\(/);
  });
});
