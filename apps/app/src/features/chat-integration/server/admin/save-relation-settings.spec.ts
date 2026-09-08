// Proves task 9.2's admin-boundary contract:
//
//   - the settings the proxy is pushed are the settings that were just
//     committed, at the version that is now in the database -- the push
//     happens AFTER the commit, never before (a push of a version that
//     never committed would make the proxy discard the real save that
//     follows it)
//   - a failed push does NOT fail the save. The proxy comes and fetches it
//     through `settings-pull` (task 3.5) instead, so refusing the save
//     would throw away a change that is already durable
//   - a malformed payload is refused BEFORE anything is written, naming
//     what was wrong
//
// `pushSettings` is mocked because it is the network boundary; everything
// on this side of it (the transaction, the version, the stored rows) runs
// against a real MongoDB replica set.

import type { MongoMemoryServer } from 'mongodb-memory-server-core';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  connectSelfContainedMongo,
  disconnectSelfContainedMongo,
} from '^/test/setup/mongo/self-contained-connection';

import { ChatRelation } from '../models/chat-relation';
import * as proxyClient from '../proxy-client';
import { ChatChannelPermission } from '../settings/models/chat-channel-permission';
import { readRelationSettings } from '../settings/relation-settings-store';
import { saveRelationSettings } from './save-relation-settings';

vi.mock('../proxy-client', async (importOriginal) => {
  const actual = await importOriginal<typeof proxyClient>();
  return { ...actual, pushSettings: vi.fn() };
});

const RELATION_ID = 'relation-under-test';
const INITIAL_VERSION = 3;

const seedRelation = () =>
  ChatRelation.create({
    relationId: RELATION_ID,
    proxyUri: 'https://proxy.example.test',
    platform: 'slack',
    workspaceId: 'workspace-0001',
    workspaceName: 'Test Workspace',
    label: null,
    state: 'active',
    settingsVersion: INITIAL_VERSION,
    createdAt: new Date(),
  });

describe('saveRelationSettings', () => {
  let mongod: MongoMemoryServer | undefined;

  beforeAll(async () => {
    ({ mongod } = await connectSelfContainedMongo(
      'growi_test_unit_save_relation_settings',
    ));
    await ChatChannelPermission.init();
  });

  afterAll(async () => {
    await disconnectSelfContainedMongo(mongod);
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(proxyClient.pushSettings).mockResolvedValue({
      ok: true,
      response: undefined,
    });
    await ChatRelation.deleteMany({});
    await ChatChannelPermission.deleteMany({});
    await seedRelation();
  });

  it('pushes the committed settings at the committed version', async () => {
    let versionVisibleInDbAtPushTime: number | undefined;
    vi.mocked(proxyClient.pushSettings).mockImplementation(async () => {
      // Reading the relation from inside the push proves the ordering: if
      // the push ran before the commit, this would still see the old
      // version.
      versionVisibleInDbAtPushTime = (
        await ChatRelation.findOne({ relationId: RELATION_ID }).lean()
      )?.settingsVersion;
      return { ok: true, response: undefined };
    });

    const outcome = await saveRelationSettings(RELATION_ID, [
      { commandName: 'create-page', allowedChannels: 'all' },
      { commandName: 'keep', allowedChannels: ['C0001'] },
    ]);

    expect(outcome).toEqual({
      status: 'saved',
      version: INITIAL_VERSION + 1,
      push: { ok: true },
    });
    expect(versionVisibleInDbAtPushTime).toBe(INITIAL_VERSION + 1);
    expect(proxyClient.pushSettings).toHaveBeenCalledWith(RELATION_ID, {
      version: INITIAL_VERSION + 1,
      settings: {
        relationId: RELATION_ID,
        channelPermissions: [
          { commandName: 'create-page', allowedChannels: 'all' },
          { commandName: 'keep', allowedChannels: ['C0001'] },
        ],
      },
    });
  });

  it("keeps the save when the push is refused -- the proxy's settings-pull picks it up later", async () => {
    vi.mocked(proxyClient.pushSettings).mockResolvedValue({
      ok: false,
      reason: 'unreachable',
    });

    const outcome = await saveRelationSettings(RELATION_ID, [
      { commandName: 'search', allowedChannels: 'none' },
    ]);

    expect(outcome).toEqual({
      status: 'saved',
      version: INITIAL_VERSION + 1,
      push: { ok: false, reason: 'unreachable' },
    });
    const read = await readRelationSettings(RELATION_ID);
    expect(read?.version).toBe(INITIAL_VERSION + 1);
    expect(read?.settings.channelPermissions).toEqual([
      { commandName: 'search', allowedChannels: 'none' },
    ]);
  });

  it('keeps the save when the push throws instead of answering', async () => {
    vi.mocked(proxyClient.pushSettings).mockRejectedValue(
      new Error('socket hang up'),
    );

    const outcome = await saveRelationSettings(RELATION_ID, [
      { commandName: 'search', allowedChannels: 'all' },
    ]);

    expect(outcome.status).toBe('saved');
    expect((await readRelationSettings(RELATION_ID))?.version).toBe(
      INITIAL_VERSION + 1,
    );
  });

  it('does not push anything for an unknown relation', async () => {
    const outcome = await saveRelationSettings('no-such-relation', [
      { commandName: 'search', allowedChannels: 'all' },
    ]);

    expect(outcome).toEqual({ status: 'relation-not-found' });
    expect(proxyClient.pushSettings).not.toHaveBeenCalled();
  });

  describe('refuses a malformed payload without writing or pushing', () => {
    const malformed: ReadonlyArray<[string, unknown]> = [
      ['not an array at all', { commandName: 'search' }],
      [
        'a command neither side knows',
        [{ commandName: 'nuke', allowedChannels: 'all' }],
      ],
      [
        'an allowedChannels value that is neither a list nor all/none',
        [{ commandName: 'search', allowedChannels: 'everything' }],
      ],
      [
        'a channel id that is not a string',
        [{ commandName: 'search', allowedChannels: [42] }],
      ],
      [
        'two rows for the same command',
        [
          { commandName: 'search', allowedChannels: 'all' },
          { commandName: 'search', allowedChannels: 'none' },
        ],
      ],
    ];

    it.each(malformed)('%s', async (_label, channelPermissions) => {
      const outcome = await saveRelationSettings(
        RELATION_ID,
        channelPermissions,
      );

      expect(outcome.status).toBe('invalid-settings');
      expect(proxyClient.pushSettings).not.toHaveBeenCalled();
      expect((await readRelationSettings(RELATION_ID))?.version).toBe(
        INITIAL_VERSION,
      );
      expect(await ChatChannelPermission.countDocuments({})).toBe(0);
    });
  });
});
