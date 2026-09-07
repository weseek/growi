import { randomUUID } from 'node:crypto';
import type { Express, Request } from 'express';
import express from 'express';
import request from 'supertest';
import { mockDeep } from 'vitest-mock-extended';

import { CHAT_INTEGRATION_PEER_PREFIX } from '~/features/chat-integration/server/consts';
import { configManager } from '~/server/service/config-manager';
import { resolveFromRoot } from '~/server/util/project-dir-utils';

import type Crowi from '.';
import { setup } from './express-init';

/**
 * A body large enough to be split across multiple stream chunks. A short
 * string would arrive in a single chunk and would therefore pass even against
 * the (broken) string-concatenation approach Gen 1 uses, which corrupts
 * multi-byte characters exactly at a chunk boundary.
 */
const buildMultibyteJsonText = (): string => {
  const paragraph =
    'これは日本語を含む本文です。ページ 1 枚ぶんの大きさを想定しています。' +
    '絵文字も混ぜる 🐢 — サロゲートペアも塊の境目に来る可能性がある。';
  return JSON.stringify({
    body: paragraph.repeat(700),
    path: '/日本語/ページ',
  });
};

type ReceivedBody = Request['body'];

const buildApp = (): { app: Express; received: { body?: ReceivedBody } } => {
  const crowi: Crowi = mockDeep<Crowi>({
    node_env: 'test',
    port: 3000,
    publicDir: resolveFromRoot('public'),
  });

  // Assigned after the mock is built: passing this through mockDeep's
  // overrides would leave the members omitted here as mock proxies, and
  // express-session rejects such values.
  crowi.sessionConfig = {
    secret: 'express-init-spec-secret',
    resave: false,
    saveUninitialized: false,
    rolling: false,
    cookie: { maxAge: 60000 },
    genid: () => randomUUID(),
  };

  const app = express();
  setup(crowi, app);

  const received: { body?: ReceivedBody } = {};
  const record = (req: Request, res: express.Response) => {
    received.body = req.body;
    res.status(204).end();
  };

  // Stand-ins for the real endpoints: the proxy-facing one under `/peer`, and
  // an admin-screen one that shares the same feature base path but is outside
  // `/peer`.
  app.post(`${CHAT_INTEGRATION_PEER_PREFIX}/notification`, record);
  app.post('/_api/v3/chat-integration/settings', record);

  return { app, received };
};

describe('express-init setup()', () => {
  beforeAll(() => {
    // `certify-origin` reads the module-level config-manager singleton, which
    // throws unless configs have been loaded from env + DB.
    vi.spyOn(configManager, 'getConfig').mockReturnValue(undefined);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe(`requests under ${CHAT_INTEGRATION_PEER_PREFIX}`, () => {
    it('delivers the request body to the route as the exact bytes that were sent', async () => {
      // Sent as text so that what goes on the wire is exactly its UTF-8 bytes
      // (superagent JSON-stringifies a Buffer argument).
      const sentText = buildMultibyteJsonText();
      const sentBytes = Buffer.from(sentText, 'utf8');
      const { app, received } = buildApp();

      await request(app)
        .post(`${CHAT_INTEGRATION_PEER_PREFIX}/notification`)
        .set('content-type', 'application/json')
        .send(sentText)
        .expect(204);

      expect(Buffer.isBuffer(received.body)).toBe(true);
      expect((received.body as Buffer).equals(sentBytes)).toBe(true);
    });

    it('delivers the exact bytes when the content type carries a charset parameter', async () => {
      const sentText = buildMultibyteJsonText();
      const sentBytes = Buffer.from(sentText, 'utf8');
      const { app, received } = buildApp();

      await request(app)
        .post(`${CHAT_INTEGRATION_PEER_PREFIX}/notification`)
        .set('content-type', 'application/json; charset=utf-8')
        .send(sentText)
        .expect(204);

      expect(Buffer.isBuffer(received.body)).toBe(true);
      expect((received.body as Buffer).equals(sentBytes)).toBe(true);
    });

    it('does not fail the request when the content type is not JSON, and does not hand the route a Buffer', async () => {
      const { app, received } = buildApp();

      await request(app)
        .post(`${CHAT_INTEGRATION_PEER_PREFIX}/notification`)
        .set('content-type', 'text/plain')
        .send('これは JSON ではない')
        .expect(204);

      // The signature guard rejects a non-Buffer body before verification;
      // this spec only pins that the parsing chain itself stays intact.
      expect(Buffer.isBuffer(received.body)).toBe(false);
    });
  });

  describe('requests under the same feature base path but outside /peer', () => {
    it('delivers a JSON-parsed object to the route', async () => {
      const { app, received } = buildApp();

      await request(app)
        .post('/_api/v3/chat-integration/settings')
        .set('content-type', 'application/json')
        .send({ isEnabled: true, label: '日本語のラベル' })
        .expect(204);

      expect(Buffer.isBuffer(received.body)).toBe(false);
      expect(received.body).toEqual({
        isEnabled: true,
        label: '日本語のラベル',
      });
    });
  });
});
