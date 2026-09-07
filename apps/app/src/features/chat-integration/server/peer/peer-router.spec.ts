// Proves task 3.5's completion condition literally: the 5 signed entry
// points pass a validly-signed request through `signatureGuard` (task 3.2)
// to their handler, and are refused when the signature does not check out;
// the 6th (`pairing/challenge`) is reachable WITHOUT a signature, per its
// own already-tested rules (task 3.4). Also proves `settings-pull` returns
// real data, and that all 6 mount points are exactly what design.md's op
// table specifies (a path typo must not reach any handler).

import { generateKeyPairSync } from 'node:crypto';
import { OP_ENDPOINTS, OP_NAMES, RESPONSE_KINDS } from '@growi/chat';
import { DEFAULT_EXPIRES_IN_SEC, sign } from '@growi/chat/server';
import type { Express } from 'express';
import express from 'express';
import type { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';
import request from 'supertest';
import { mock } from 'vitest-mock-extended';

import {
  connectSelfContainedMongo,
  disconnectSelfContainedMongo,
} from '^/test/setup/mongo/self-contained-connection';

import type Crowi from '~/server/crowi';

import { CHAT_INTEGRATION_PEER_PREFIX } from '../consts';
import { buildHelpContent } from '../content';
import { createChatIntegrationRouter } from '../index';
import { storePeerKey } from '../keys';
import type { ChatKeyEncryptionEnv } from '../keys/key-encryption';
import { encryptChatKeyForStorage } from '../keys/key-encryption';
import { ChatIntegrationKey } from '../keys/models/chat-integration-key';
import { ChatProcessedRequest } from '../models/chat-processed-request';
import { ChatRelation } from '../models/chat-relation';
import { ChatRequestNonce } from '../models/chat-request-nonce';
import { ChatChallengeAttempt } from '../pairing/models/chat-challenge-attempt';
import { ChatPendingPairing } from '../pairing/models/pending-pairing';
import { ChatChannelPermission } from '../settings/models/chat-channel-permission';

/**
 * `command`'s handler (task 5.1) needs a `Crowi` instance -- `help` (the
 * kind every fixture below uses) never touches any of its services, so an
 * auto-stubbed mock is enough to prove the wiring without faking search/ACL
 * behavior this file has no business asserting on.
 */
const buildMockCrowi = (): Crowi => mock<Crowi>();

const JSON_CONTENT_TYPE = 'application/json';
const MOUNT_PATH = '/_api/v3/chat-integration';
const RELATION_ID = 'relation-under-test';
const KEY_ID = 'peer-key-0001';

/** A clearly-fake 32-byte value; the tests only need AES-256 to accept it. */
const TEST_ENCRYPTION_KEY: ChatKeyEncryptionEnv = {
  CHAT_INTEGRATION_KEY_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString('base64'),
};

const peerKeyPair = generateKeyPairSync('ed25519');
/** A key pair GROWI never registered -- signs bytes that must not check out. */
const rogueKeyPair = generateKeyPairSync('ed25519');

/**
 * An app shaped like the real one: `express.raw` under the peer prefix
 * (`server/crowi/express-init.js`, task 2.1), the app-wide urlencoded parser
 * behind it, and the ACTUAL production router from `server/index.ts`/
 * `peer-router.ts` -- not a re-implementation.
 */
const buildApp = (): Express => {
  const app = express();
  app.use(
    CHAT_INTEGRATION_PEER_PREFIX,
    express.raw({ type: JSON_CONTENT_TYPE, limit: '10mb' }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(MOUNT_PATH, createChatIntegrationRouter(buildMockCrowi()));
  return app;
};

const signedPost = (
  app: Express,
  path: string,
  bodyText: string,
  options: {
    readonly signedWith?: ReturnType<typeof generateKeyPairSync>['privateKey'];
  } = {},
) => {
  const bytes = Buffer.from(bodyText, 'utf8');
  const result = sign({
    method: 'POST',
    headers: { 'content-type': JSON_CONTENT_TYPE },
    body: bytes,
    key: { relationId: RELATION_ID, keyId: KEY_ID },
    privateKey: options.signedWith ?? peerKeyPair.privateKey,
    expiresInSec: DEFAULT_EXPIRES_IN_SEC,
  });

  const agent = request(app).post(path);
  agent.set('content-type', JSON_CONTENT_TYPE);
  for (const [name, value] of Object.entries(result.headers)) {
    agent.set(name, value);
  }
  return agent.send(bodyText);
};

/** Full request path (from the app root), derived from `OP_ENDPOINTS` --
 * not hand-written, so this test cannot silently drift from the mount
 * points `peer-router.ts` itself derives the same way. */
const pathFor = (op: keyof typeof OP_NAMES): string => {
  const template = OP_ENDPOINTS[OP_NAMES[op]].pathTemplate;
  return template.replace('{growiUri}', '');
};

const commandBody = JSON.stringify({
  relationId: RELATION_ID,
  op: OP_NAMES.command,
  requestId: 'req-0001',
  actor: { platform: 'slack', accountId: 'U0001', displayName: 'Alice' },
  channel: {
    platform: 'slack',
    channelId: 'C0001',
    channelName: 'general',
    isPrivate: false,
  },
  kind: 'help',
});

const accountLinkStartBody = JSON.stringify({
  relationId: RELATION_ID,
  op: OP_NAMES.accountLinkStart,
  actor: { platform: 'slack', accountId: 'U0001', displayName: 'Alice' },
});

const settingsPullBody = JSON.stringify({
  relationId: RELATION_ID,
  op: OP_NAMES.settingsPull,
});

const newKeyJwk = generateKeyPairSync('ed25519').publicKey.export({
  format: 'jwk',
});

const keyRegisterBody = JSON.stringify({
  relationId: RELATION_ID,
  op: OP_NAMES.keyRegisterToGrowi,
  key: {
    keyId: 'peer-key-0002',
    publicKeyJwk: newKeyJwk,
    validFrom: new Date().toISOString(),
  },
});

const keyRevokeBody = JSON.stringify({
  relationId: RELATION_ID,
  op: OP_NAMES.keyRevokeToGrowi,
  keyId: 'peer-key-0002',
});

/** Every signed op this task wires, paired with a validly-shaped body. */
const SIGNED_CASES: ReadonlyArray<{
  readonly op: keyof typeof OP_NAMES;
  readonly body: string;
}> = [
  { op: 'command', body: commandBody },
  { op: 'keyRegisterToGrowi', body: keyRegisterBody },
  { op: 'keyRevokeToGrowi', body: keyRevokeBody },
  { op: 'settingsPull', body: settingsPullBody },
  { op: 'accountLinkStart', body: accountLinkStartBody },
];

describe('peer-router (task 3.5 -- the 6 entry points, wired for real)', () => {
  let mongod: MongoMemoryServer | undefined;
  const previousEnv = { ...process.env };
  let app: Express;

  beforeAll(async () => {
    ({ mongod } = await connectSelfContainedMongo(
      'growi_test_unit_peer_router',
    ));
    await ChatRequestNonce.init();
  });

  beforeEach(async () => {
    app = buildApp();
    Object.assign(process.env, TEST_ENCRYPTION_KEY);
    await ChatRequestNonce.deleteMany({});
    await ChatIntegrationKey.deleteMany({});
    await ChatRelation.deleteMany({});
    await ChatChannelPermission.deleteMany({});
    await ChatPendingPairing.deleteMany({});
    await ChatChallengeAttempt.deleteMany({});
    await ChatProcessedRequest.deleteMany({});

    await storePeerKey(
      { relationId: RELATION_ID, keyId: KEY_ID },
      peerKeyPair.publicKey.export({ format: 'jwk' }),
    );
    await ChatRelation.create({
      relationId: RELATION_ID,
      proxyUri: 'https://proxy.example.test',
      platform: 'slack',
      workspaceId: 'workspace-0001',
      workspaceName: 'Test Workspace',
      label: null,
      state: 'active',
      settingsVersion: 7,
      createdAt: new Date(),
    });
  });

  afterEach(() => {
    process.env = { ...previousEnv };
  });

  afterAll(async () => {
    await disconnectSelfContainedMongo(mongod);
  });

  describe('the 5 signed entry points', () => {
    it.each(
      SIGNED_CASES,
    )('$op: a validly-signed request reaches its handler (passes signatureGuard)', async ({
      op,
      body,
    }) => {
      const response = await signedPost(app, pathFor(op), body);
      expect(response.status).toBe(200);
    });

    it.each(
      SIGNED_CASES,
    )('$op: a request signed with a key GROWI never registered is refused', async ({
      op,
      body,
    }) => {
      const response = await signedPost(app, pathFor(op), body, {
        signedWith: rogueKeyPair.privateKey,
      });
      expect(response.status).toBe(401);
    });

    it.each(SIGNED_CASES)('$op: an unsigned request is refused', async ({
      op,
      body,
    }) => {
      const response = await request(app)
        .post(pathFor(op))
        .set('content-type', JSON_CONTENT_TYPE)
        .send(body);
      expect(response.status).toBe(401);
    });
  });

  describe('settings-pull', () => {
    it('returns the real settingsVersion and channel permissions for the relation, not a stub', async () => {
      await ChatChannelPermission.create([
        {
          relationId: RELATION_ID,
          commandName: 'search',
          allowedChannels: ['C0001', 'C0002'],
        },
        {
          relationId: RELATION_ID,
          commandName: 'help',
          allowedChannels: [],
        },
      ]);

      const response = await signedPost(
        app,
        pathFor('settingsPull'),
        settingsPullBody,
      );

      expect(response.status).toBe(200);
      expect(response.body.version).toBe(7);
      expect(response.body.settings.relationId).toBe(RELATION_ID);
      expect(response.body.settings.channelPermissions).toEqual(
        expect.arrayContaining([
          {
            commandName: 'search',
            allowedChannels: ['C0001', 'C0002'],
          },
          { commandName: 'help', allowedChannels: [] },
        ]),
      );
    });

    it('reflects a version bump and updated permission rows on the next pull', async () => {
      await ChatRelation.updateOne(
        { relationId: RELATION_ID },
        { $set: { settingsVersion: 8 } },
      );
      await ChatChannelPermission.create({
        relationId: RELATION_ID,
        commandName: 'keep',
        allowedChannels: ['C0003'],
      });

      const response = await signedPost(
        app,
        pathFor('settingsPull'),
        settingsPullBody,
      );

      expect(response.status).toBe(200);
      expect(response.body.version).toBe(8);
      expect(response.body.settings.channelPermissions).toEqual([
        { commandName: 'keep', allowedChannels: ['C0003'] },
      ]);
    });
  });

  describe('command (task 5.1 -- real behavior, not a stub)', () => {
    it('answers a real help response, proving the wiring reaches command-endpoint.ts', async () => {
      const response = await signedPost(app, pathFor('command'), commandBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        kind: RESPONSE_KINDS.help,
        commands: buildHelpContent(),
      });
    });
  });

  describe('pairing/challenge (the one unsigned entry point)', () => {
    const PAIRING_PATH = '/peer/pairing/challenge';

    const insertPendingPairing = async (): Promise<{
      readonly registrationCode: string;
    }> => {
      const registrationCode = `code-${new mongoose.Types.ObjectId().toHexString()}`;
      const keyPair = generateKeyPairSync('ed25519');
      const pem = keyPair.privateKey
        .export({ type: 'pkcs8', format: 'pem' })
        .toString();

      await ChatPendingPairing.create({
        registrationCode,
        proxyUri: 'https://proxy.example.test',
        growiUri: 'https://growi.example.test',
        createdBy: new mongoose.Types.ObjectId(),
        ownKeyId: 'pending-key-0001',
        ownKeyPair: encryptChatKeyForStorage(pem),
        expiresAt: new Date(Date.now() + 10 * 60_000),
      });

      return { registrationCode };
    };

    it('answers a live pending pairing WITHOUT any signature -- signatureGuard is not in front of it', async () => {
      const { registrationCode } = await insertPendingPairing();
      const challenge = Buffer.alloc(32, 1).toString('base64url');

      const response = await request(app)
        .post(`${MOUNT_PATH}${PAIRING_PATH}`)
        .set('content-type', JSON_CONTENT_TYPE)
        // No RFC 9421 signature headers at all -- if this were behind
        // signatureGuard it would be refused for `unsupported-media-type`
        // or a missing signature; instead it is judged by pairingEndpoint's
        // own rules (a matching, unexpired pending registration code).
        .send(JSON.stringify({ registrationCode, challenge }));

      expect(response.status).toBe(200);
      expect(response.body.challenge).toBe(challenge);
      expect(typeof response.body.challengeSignature).toBe('string');
    });

    it('refuses (401, not signature-guard-shaped) when no pending pairing matches', async () => {
      const challenge = Buffer.alloc(32, 2).toString('base64url');

      const response = await request(app)
        .post(`${MOUNT_PATH}${PAIRING_PATH}`)
        .set('content-type', JSON_CONTENT_TYPE)
        .send(JSON.stringify({ registrationCode: 'no-such-code', challenge }));

      expect(response.status).toBe(401);
    });
  });

  describe('mount points are exactly design.md’s 6 paths', () => {
    it('does not match a merely similar path', async () => {
      const response = await signedPost(
        app,
        `${pathFor('settingsPull')}-typo`,
        settingsPullBody,
      );
      expect(response.status).toBe(404);
    });

    it('does not match the feature base path with no sub-path', async () => {
      const response = await request(app)
        .post(MOUNT_PATH)
        .set('content-type', JSON_CONTENT_TYPE)
        .send('{}');
      expect(response.status).toBe(404);
    });
  });
});
