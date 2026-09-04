import { type DeepMockProxy, mock, mockDeep } from 'vitest-mock-extended';

import { REQUIRES_INBOUND_REACHABILITY } from '../capabilities/index.js';
import type { PrismaClient } from '../db/index.js';
import type { ConnectionManager, PlatformFacade } from '../platform/index.js';
import type {
  DistributedLock,
  PlatformEvent,
  PlatformEventSink,
} from '../types/index.js';
import type { ProxyConfig } from './config.js';
import {
  createDeferredEventSink,
  createProxyDependencies,
} from './dependencies.js';
import type { Sweeper, SweeperDeps } from './sweeper.js';

const config = (overrides: Partial<ProxyConfig> = {}): ProxyConfig => ({
  platformApp: {
    stateConnectionString: 'postgresql://state@postgres:5432/db',
    slack: {
      signingSecret: 'signing',
      clientId: 'client',
      clientSecret: 'secret',
      appToken: 'xapp-1',
    },
  },
  closedNetwork: { allowList: [], trustedCaCertsFor: () => [] },
  cipher: { encrypt: (v) => v, decrypt: (v) => v },
  databaseUrl: 'postgresql://proxy@postgres:5432/proxy',
  http: { port: 8080, bodyLimitBytes: 1024 },
  mattermostInstallations: [],
  ...overrides,
});

const facadeMock = (): PlatformFacade => {
  const facade = mock<PlatformFacade>();
  facade.connections.mockReturnValue(mock<ConnectionManager>());
  return facade;
};

interface Built {
  readonly db: PrismaClient;
  readonly facade: PlatformFacade;
  readonly createDb: ReturnType<typeof vi.fn>;
  readonly createFacade: ReturnType<typeof vi.fn>;
}

const built = (): Built => {
  const db = mock<PrismaClient>();
  const facade = facadeMock();
  return {
    db,
    facade,
    createDb: vi.fn(() => db),
    createFacade: vi.fn(async () => facade),
  };
};

describe('createDeferredEventSink', () => {
  const event: PlatformEvent = {
    kind: 'mention',
    platform: 'slack',
    channel: {
      platform: 'slack',
      channelId: 'C1',
      channelName: 'general',
      isPrivate: false,
    },
    actor: { platform: 'slack', accountId: 'U1', displayName: 'someone' },
    text: 'hello',
    interaction: null,
  };

  it('hands an event to the sink that was attached later', async () => {
    const target = mock<PlatformEventSink>();
    const deferred = createDeferredEventSink();

    deferred.attach(target);
    await deferred.sink.handle(event);

    expect(target.handle).toHaveBeenCalledWith(event);
  });

  it('refuses an event that arrives before anything is attached, rather than dropping it silently', async () => {
    const deferred = createDeferredEventSink();

    // The window exists because the facade has to be built before the flows
    // that consume its events can be. An event here means a connection opened
    // earlier than the wiring expects, which the operator must be told about.
    await expect(deferred.sink.handle(event)).rejects.toThrow(/not ready/i);
  });
});

describe('createProxyDependencies', () => {
  it("builds the storage client from the app's own connection string, not the Chat SDK's", async () => {
    const { createDb, createFacade } = built();

    await createProxyDependencies(config(), { createDb, createFacade });

    expect(createDb).toHaveBeenCalledWith(
      'postgresql://proxy@postgres:5432/proxy',
    );
  });

  it('opens the platform connections from the configured services', async () => {
    const { createDb, createFacade } = built();
    const proxyConfig = config();

    await createProxyDependencies(proxyConfig, { createDb, createFacade });

    expect(createFacade).toHaveBeenCalledWith(
      proxyConfig.platformApp,
      expect.anything(),
      expect.anything(),
    );
  });

  it('gives the facade a sink that is already wired, so an event arriving on the first connection is handled', async () => {
    const { createDb, createFacade } = built();

    await createProxyDependencies(config(), { createDb, createFacade });

    const sink = createFacade.mock.calls[0]?.[2] as PlatformEventSink;
    expect(typeof sink.handle).toBe('function');
    // The knot is tied by the time this function returns: an event handed to
    // this sink reaches a flow rather than the "nothing is attached" refusal.
    const outcome = await sink
      .handle({
        kind: 'link-posted',
        platform: 'slack',
        channel: {
          platform: 'slack',
          channelId: 'C1',
          channelName: 'general',
          isPrivate: false,
        },
        actor: { platform: 'slack', accountId: 'U1', displayName: 'someone' },
        messageRef: {
          channel: {
            platform: 'slack',
            channelId: 'C1',
            channelName: 'general',
            isPrivate: false,
          },
          messageId: 'M1',
        },
        urls: ['https://growi.internal/page'],
      })
      .then(() => null)
      .catch((error: unknown) => error);

    // Whatever this stub-backed storage does with the event, the one answer
    // that must NOT come back is the deferred sink's refusal: that would mean
    // the graph was handed out with its knot still untied.
    expect(String(outcome)).not.toMatch(/not ready/i);
  });

  it('creates every declared Mattermost installation before the connections are reconciled', async () => {
    const { db, facade, createDb, createFacade } = built();
    const saved: string[] = [];
    const store = {
      save: vi.fn((_p: unknown, workspaceId: string) => {
        saved.push(workspaceId);
        return Promise.resolve('installation-1');
      }),
    };

    await createProxyDependencies(
      config({
        mattermostInstallations: [
          {
            workspaceId: 'team-1',
            workspaceName: 'Example',
            baseUrl: 'https://mattermost.internal',
            botToken: 'bot-token',
          },
        ],
      }),
      { createDb, createFacade, createInstallationStore: () => store },
    );

    expect(saved).toEqual(['team-1']);
    // Reconciling is what opens the Mattermost connection, and it counts
    // installation rows -- so the rows have to exist first.
    expect(facade.connections().start).not.toHaveBeenCalled();
    expect(db).toBeDefined();
  });

  it('hands the routes one reachability table, the declared one', async () => {
    const { createDb, createFacade } = built();

    const runtime = await createProxyDependencies(config(), {
      createDb,
      createFacade,
    });

    expect(runtime.routes.reachability).toBe(REQUIRES_INBOUND_REACHABILITY);
  });

  it("hands the OAuth callback the app's own configuration, which is what an exchange is signed with", async () => {
    const { createDb, createFacade } = built();
    const proxyConfig = config();

    const runtime = await createProxyDependencies(proxyConfig, {
      createDb,
      createFacade,
    });

    expect(runtime.routes.install.appConfig).toBe(proxyConfig.platformApp);
  });

  it('gives every signed endpoint a guard built from the same storage', async () => {
    const { createDb, createFacade } = built();

    const runtime = await createProxyDependencies(config(), {
      createDb,
      createFacade,
    });

    expect(runtime.routes.notification.signature).toBe(
      runtime.routes.key.signature,
    );
    expect(runtime.routes.read.signature).toBe(runtime.routes.key.signature);
  });

  it('shuts the platform down before it lets go of storage, so nothing in flight loses its connection first', async () => {
    const { db, facade, createDb, createFacade } = built();
    const order: string[] = [];
    vi.mocked(facade.shutdown).mockImplementation(() => {
      order.push('platform');
      return Promise.resolve();
    });
    (db.$disconnect as ReturnType<typeof vi.fn>).mockImplementation(() => {
      order.push('storage');
      return Promise.resolve();
    });

    const runtime = await createProxyDependencies(config(), {
      createDb,
      createFacade,
    });
    await runtime.shutdown();

    expect(order).toEqual(['platform', 'storage']);
  });

  it('lets go of storage even when the platform refuses to shut down', async () => {
    const { db, facade, createDb, createFacade } = built();
    vi.mocked(facade.shutdown).mockRejectedValue(new Error('socket stuck'));

    const reportOperationalFailure = vi.fn();
    const runtime = await createProxyDependencies(config(), {
      createDb,
      createFacade,
      reporters: { reportOperationalFailure },
    });
    await runtime.shutdown();

    expect(db.$disconnect).toHaveBeenCalled();
    // The operator is told, rather than the failure disappearing behind the
    // teardown that carried on regardless.
    expect(reportOperationalFailure).toHaveBeenCalled();
  });
});

describe('the periodic work createProxyDependencies composes', () => {
  /** Captures the work-set the sweeper is built with, without running it. */
  const capture = async (): Promise<{
    readonly deps: SweeperDeps;
    readonly db: DeepMockProxy<PrismaClient>;
    readonly locks: DistributedLock;
  }> => {
    // Deep, unlike the other tests here: this one calls THROUGH to the Prisma
    // delegates to prove each sweep reaches the table it is named after.
    const db = mockDeep<PrismaClient>();
    for (const delegate of [
      db.requestNonce,
      db.processedNotificationTarget,
      db.pendingCollection,
      db.pairingOrder,
    ]) {
      delegate.deleteMany.mockResolvedValue({ count: 0 });
    }
    db.installation.findMany.mockResolvedValue([]);
    const locks = mock<DistributedLock>();
    // Built here rather than through `facadeMock()`: this test needs the
    // facade's own mock handle to say which lock `locks()` answers with.
    const facade = mock<PlatformFacade>();
    facade.connections.mockReturnValue(mock<ConnectionManager>());
    facade.locks.mockReturnValue(locks);
    let captured: SweeperDeps | null = null;

    await createProxyDependencies(config(), {
      createDb: () => db,
      createFacade: () => Promise.resolve(facade),
      createSweeper: (deps) => {
        captured = deps;
        return mock<Sweeper>();
      },
    });

    if (captured == null) throw new Error('no sweeper was built');
    return { deps: captured, db, locks };
  };

  it('declares exactly the four tables design.md lists under 期限切れの掃除', async () => {
    const { deps } = await capture();

    // Asserted by name and as a whole list: a missing entry is a table that
    // grows forever, and the names are what an operator reads in the failure
    // message the sweeper reports.
    expect(deps.sweeps.map((sweep) => sweep.name)).toEqual([
      'request_nonce',
      'processed_notification_target',
      'pending_collection',
      'pairing_order',
    ]);
  });

  it('binds each declared sweep to the table of that name', async () => {
    const { deps, db } = await capture();
    const at = new Date('2026-04-01T00:00:00.000Z');
    const delegates = {
      request_nonce: db.requestNonce,
      processed_notification_target: db.processedNotificationTarget,
      pending_collection: db.pendingCollection,
      pairing_order: db.pairingOrder,
    } as const;

    // Called through the extracted function rather than through the
    // repository: this is how `sweeper.ts` calls it, so calling it any other
    // way would not prove the extracted one still reaches its table.
    await Promise.all(deps.sweeps.map((sweep) => sweep.deleteExpired(at)));

    for (const [name, delegate] of Object.entries(delegates)) {
      expect(
        delegate.deleteMany,
        `${name} was not reached by the sweep named after it`,
      ).toHaveBeenCalledTimes(1);
    }
    expect(db.pairingOrder.deleteMany).toHaveBeenCalledWith({
      // The one sweep whose condition is not `expiresAt` alone -- a consumed
      // order still answers a resubmission of its code.
      where: { consumedAt: null, expiresAt: { lte: at } },
    });
  });

  it("takes the lock from the facade's own state, the one the connections contend on", async () => {
    const { deps, locks } = await capture();

    // Not a second lock built here: the sweep has to contend in the same key
    // space, which only the facade's state adapter provides.
    expect(deps.locks).toBe(locks);
  });

  it('refreshes the channel inventory of every installation, whichever service it belongs to', async () => {
    const { deps, db } = await capture();
    db.installation.findMany.mockResolvedValue([
      { id: 'inst-1', workspaceId: 'T1' },
      { id: 'inst-2', workspaceId: 'T2' },
    ] as never);

    const ids = await deps.listInstallationIds();

    // Two rows per service, and this app serves four -- the point being that
    // the walk is over the declared services, not over one hard-coded name.
    expect(new Set(ids)).toEqual(new Set(['inst-1', 'inst-2']));
    expect(ids).toHaveLength(8);
  });
});
