// Proves task 9.1's routing-level contract:
//   - every endpoint requires a real, logged-in GROWI ADMIN (not just any
//     logged-in user), same convention as `oauth-install-router.spec.ts`
//   - `GET /encryption-status` relays `describeChatKeyEncryptionConfiguration`
//   - `GET /relations` lists what `admin-service.ts` returns
//   - `GET /relations/:id/capabilities` and `.../connection-status` relay
//     `fetchCapabilities`/`fetchConnectionStatus` VERBATIM -- including a
//     field this test invents that no real platform sends yet, proving
//     there is no hardcoded per-platform allowlist silently dropping fields
//   - `GET`/`POST /relations/:id/settings` (task 9.2) round trip a saved
//     channel permission, including the 'all'/'none' values, and refuse a
//     malformed payload with 400 without touching the stored settings
//   - `POST /pairing` forwards to `submitPairingRequest` and relays whatever
//     outcome it returns, without a second encryption check duplicating
//     `pairing-service.ts`'s own

import type { CapabilityReport, ConnectionStatusView } from '@growi/chat';
import type { IUserHasId } from '@growi/core/dist/interfaces';
import type { Express, NextFunction, Request, Response } from 'express';
import express from 'express';
import type { MongoMemoryServer } from 'mongodb-memory-server-core';
import { Types } from 'mongoose';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { mock } from 'vitest-mock-extended';

import {
  connectSelfContainedMongo,
  disconnectSelfContainedMongo,
} from '^/test/setup/mongo/self-contained-connection';

import type Crowi from '~/server/crowi';
import addCustomFunctionToResponse from '~/server/routes/apiv3/response';

import { ChatRelation } from '../models/chat-relation';
import type { PairingOutcome } from '../pairing/pairing-service';
import * as pairingService from '../pairing/pairing-service';
import * as proxyClient from '../proxy-client';
import { ChatChannelPermission } from '../settings/models/chat-channel-permission';
import { createAdminRouter } from './admin-router';

vi.mock('../pairing/pairing-service', async (importOriginal) => {
  const actual = await importOriginal<typeof pairingService>();
  return { ...actual, submitPairingRequest: vi.fn() };
});
vi.mock('../proxy-client', async (importOriginal) => {
  const actual = await importOriginal<typeof proxyClient>();
  return {
    ...actual,
    fetchCapabilities: vi.fn(),
    fetchConnectionStatus: vi.fn(),
    pushSettings: vi.fn(),
  };
});

const MOUNT_PATH = '/_api/v3/chat-integration/admin';
const RELATION_ID = 'relation-under-test';

const adminUser: IUserHasId = {
  _id: new Types.ObjectId().toString(),
  username: 'admin-user',
  status: 2,
  admin: true,
} as IUserHasId;

const nonAdminUser: IUserHasId = {
  _id: new Types.ObjectId().toString(),
  username: 'plain-user',
  status: 2,
  admin: false,
} as IUserHasId;

const buildMockCrowi = (): Crowi => mock<Crowi>();

const buildApp = (injectUser?: IUserHasId): Express => {
  const responseHelpers: { response: Record<string, unknown> } = {
    response: {},
  };
  addCustomFunctionToResponse(responseHelpers);

  const app = express();
  app.use(express.json());
  app.use((_req: Request, res: Response, next: NextFunction) => {
    Object.assign(res, responseHelpers.response);
    next();
  });
  if (injectUser != null) {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as Request & { user: IUserHasId }).user = injectUser;
      next();
    });
  }
  app.use(MOUNT_PATH, createAdminRouter(buildMockCrowi()));
  return app;
};

const seedRelation = () =>
  ChatRelation.create({
    relationId: RELATION_ID,
    proxyUri: 'https://proxy.example.test',
    platform: 'slack',
    workspaceId: 'workspace-0001',
    workspaceName: 'Test Workspace',
    label: null,
    state: 'active',
    settingsVersion: 0,
    createdAt: new Date(),
  });

describe('admin-router', () => {
  let mongod: MongoMemoryServer | undefined;

  beforeAll(async () => {
    ({ mongod } = await connectSelfContainedMongo(
      'growi_test_unit_admin_router',
    ));
    await ChatChannelPermission.init();
  });

  afterAll(async () => {
    await disconnectSelfContainedMongo(mongod);
  });

  beforeEach(async () => {
    await ChatRelation.deleteMany({});
    await ChatChannelPermission.deleteMany({});
    vi.clearAllMocks();
    vi.mocked(proxyClient.pushSettings).mockResolvedValue({
      ok: true,
      response: undefined,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login / admin requirement (all endpoints)', () => {
    it('refuses GET /relations without a logged-in session', async () => {
      const app = buildApp();
      const response = await request(app).get(`${MOUNT_PATH}/relations`);
      expect(response.status).not.toBe(200);
    });

    it('refuses GET /relations for a logged-in NON-admin user', async () => {
      const app = buildApp(nonAdminUser);
      const response = await request(app).get(`${MOUNT_PATH}/relations`);
      expect(response.status).not.toBe(200);
    });

    it('refuses POST /pairing for a logged-in NON-admin user', async () => {
      const app = buildApp(nonAdminUser);
      const response = await request(app).post(`${MOUNT_PATH}/pairing`).send({
        registrationCode: 'code',
        proxyUri: 'https://proxy.example.test',
        growiUri: 'https://growi.example.test',
        growiLabel: 'My GROWI',
      });
      expect(response.status).not.toBe(200);
      expect(pairingService.submitPairingRequest).not.toHaveBeenCalled();
    });
  });

  describe('GET /encryption-status', () => {
    it("relays describeChatKeyEncryptionConfiguration's verdict for an admin", async () => {
      const app = buildApp(adminUser);
      const response = await request(app).get(
        `${MOUNT_PATH}/encryption-status`,
      );
      expect(response.status).toBe(200);
      // Test env carries no CHAT_INTEGRATION_KEY_ENCRYPTION_KEY.
      expect(response.body.configured).toBe(false);
      expect(response.body.reason).toBe('unset');
    });
  });

  describe('GET /relations', () => {
    it('lists relations for an admin', async () => {
      await seedRelation();
      const app = buildApp(adminUser);

      const response = await request(app).get(`${MOUNT_PATH}/relations`);

      expect(response.status).toBe(200);
      expect(response.body.relations).toHaveLength(1);
      expect(response.body.relations[0].relationId).toBe(RELATION_ID);
      expect(response.body.relations[0].workspaceName).toBe('Test Workspace');
    });
  });

  describe('GET /relations/:relationId/capabilities', () => {
    it('relays CapabilityReport verbatim, including a field no known platform sends yet', async () => {
      // An invented capability/level combination proves the router does not
      // filter or branch on known fields -- it passes through whatever the
      // proxy answers with, exactly as this task's own text requires.
      const report: CapabilityReport = {
        platforms: [
          {
            platform: 'slack',
            capabilities: [
              {
                capability: 'slashCommand',
                level: 'none',
                substitute: 'mention',
              },
              {
                capability: 'never-seen-before-capability',
                level: 'degraded',
                substitute: 'a made-up workaround',
              },
            ],
          },
        ],
      };
      vi.mocked(proxyClient.fetchCapabilities).mockResolvedValue({
        ok: true,
        response: report,
      });
      const app = buildApp(adminUser);

      const response = await request(app).get(
        `${MOUNT_PATH}/relations/${RELATION_ID}/capabilities`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(report);
      expect(proxyClient.fetchCapabilities).toHaveBeenCalledWith(RELATION_ID);
    });

    it('answers 502 when the proxy call fails', async () => {
      vi.mocked(proxyClient.fetchCapabilities).mockResolvedValue({
        ok: false,
        reason: 'unreachable',
      });
      const app = buildApp(adminUser);

      const response = await request(app).get(
        `${MOUNT_PATH}/relations/${RELATION_ID}/capabilities`,
      );

      expect(response.status).toBe(502);
    });
  });

  describe('GET /relations/:relationId/connection-status', () => {
    it('relays ConnectionStatusView verbatim', async () => {
      const view: ConnectionStatusView = {
        platform: 'slack',
        health: 'connected',
        since: '2026-01-01T00:00:00.000Z',
      };
      vi.mocked(proxyClient.fetchConnectionStatus).mockResolvedValue({
        ok: true,
        response: view,
      });
      const app = buildApp(adminUser);

      const response = await request(app).get(
        `${MOUNT_PATH}/relations/${RELATION_ID}/connection-status`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(view);
    });
  });

  describe('channel permission settings (task 9.2)', () => {
    const settingsPath = `${MOUNT_PATH}/relations/${RELATION_ID}/settings`;

    it('refuses the save for a logged-in NON-admin user', async () => {
      await seedRelation();
      const app = buildApp(nonAdminUser);

      const response = await request(app)
        .post(settingsPath)
        .send({
          channelPermissions: [
            { commandName: 'create-page', allowedChannels: 'all' },
          ],
        });

      expect(response.status).not.toBe(200);
      expect(await ChatChannelPermission.countDocuments({})).toBe(0);
    });

    it('reads back what was saved, for all three allowedChannels forms', async () => {
      await seedRelation();
      const app = buildApp(adminUser);
      const channelPermissions = [
        { commandName: 'create-page', allowedChannels: 'all' },
        { commandName: 'keep', allowedChannels: 'none' },
        { commandName: 'search', allowedChannels: ['C0001', 'C0002'] },
      ];

      const saved = await request(app)
        .post(settingsPath)
        .send({ channelPermissions });

      expect(saved.status).toBe(200);
      expect(saved.body).toEqual({
        status: 'saved',
        version: 1,
        push: { ok: true },
      });

      const read = await request(app).get(settingsPath);

      expect(read.status).toBe(200);
      expect(read.body.version).toBe(1);
      expect(read.body.settings).toEqual({
        relationId: RELATION_ID,
        channelPermissions: expect.arrayContaining(channelPermissions),
      });
    });

    it('reports a failed push as a successful save the proxy has yet to hear about', async () => {
      await seedRelation();
      vi.mocked(proxyClient.pushSettings).mockResolvedValue({
        ok: false,
        reason: 'unreachable',
      });
      const app = buildApp(adminUser);

      const response = await request(app)
        .post(settingsPath)
        .send({
          channelPermissions: [
            { commandName: 'search', allowedChannels: 'all' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'saved',
        version: 1,
        push: { ok: false, reason: 'unreachable' },
      });
      const read = await request(app).get(settingsPath);
      expect(read.body.settings.channelPermissions).toEqual([
        { commandName: 'search', allowedChannels: 'all' },
      ]);
    });

    it('answers 400 for a malformed payload, changing nothing', async () => {
      await seedRelation();
      const app = buildApp(adminUser);

      const response = await request(app)
        .post(settingsPath)
        .send({
          channelPermissions: [
            { commandName: 'search', allowedChannels: 'everything' },
          ],
        });

      expect(response.status).toBe(400);
      expect(proxyClient.pushSettings).not.toHaveBeenCalled();
      const read = await request(app).get(settingsPath);
      expect(read.body.version).toBe(0);
      expect(read.body.settings.channelPermissions).toEqual([]);
    });

    it('answers 404 for a relation that does not exist', async () => {
      const app = buildApp(adminUser);

      const saveResponse = await request(app)
        .post(`${MOUNT_PATH}/relations/no-such-relation/settings`)
        .send({
          channelPermissions: [
            { commandName: 'search', allowedChannels: 'all' },
          ],
        });
      const readResponse = await request(app).get(
        `${MOUNT_PATH}/relations/no-such-relation/settings`,
      );

      expect(saveResponse.status).toBe(404);
      expect(readResponse.status).toBe(404);
      expect(proxyClient.pushSettings).not.toHaveBeenCalled();
    });
  });

  describe('POST /pairing', () => {
    it('answers 400 when a required field is missing', async () => {
      const app = buildApp(adminUser);

      const response = await request(app).post(`${MOUNT_PATH}/pairing`).send({
        registrationCode: 'code',
      });

      expect(response.status).toBe(400);
      expect(pairingService.submitPairingRequest).not.toHaveBeenCalled();
    });

    it('forwards to submitPairingRequest with the logged-in admin as createdBy, and relays its outcome', async () => {
      const outcome: PairingOutcome = {
        status: 'paired',
        relationId: 'relation-new',
        inheritance: { inheritedFrom: null, movedCount: 0, discardedCount: 0 },
      };
      vi.mocked(pairingService.submitPairingRequest).mockResolvedValue(outcome);
      const app = buildApp(adminUser);

      const response = await request(app).post(`${MOUNT_PATH}/pairing`).send({
        registrationCode: 'the-code',
        proxyUri: 'https://proxy.example.test',
        growiUri: 'https://growi.example.test',
        growiLabel: 'My GROWI',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(outcome);
      expect(pairingService.submitPairingRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationCode: 'the-code',
          proxyUri: 'https://proxy.example.test',
          growiUri: 'https://growi.example.test',
          growiLabel: 'My GROWI',
        }),
      );
      const calledWith = vi.mocked(pairingService.submitPairingRequest).mock
        .calls[0][0];
      expect(calledWith.createdBy.toString()).toBe(adminUser._id);
    });

    it('relays a "key-encryption-unconfigured" outcome without a second check duplicating pairing-service', async () => {
      const outcome: PairingOutcome = { status: 'key-encryption-unconfigured' };
      vi.mocked(pairingService.submitPairingRequest).mockResolvedValue(outcome);
      const app = buildApp(adminUser);

      const response = await request(app).post(`${MOUNT_PATH}/pairing`).send({
        registrationCode: 'the-code',
        proxyUri: 'https://proxy.example.test',
        growiUri: 'https://growi.example.test',
        growiLabel: 'My GROWI',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(outcome);
    });
  });
});
