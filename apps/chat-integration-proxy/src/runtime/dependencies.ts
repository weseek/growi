// Where the whole object graph is built. Every other file in this app takes
// what it needs as arguments and constructs nothing it did not receive
// (`createRoutesApp` most explicitly -- Implementation Note 8.5 (c)), which
// leaves exactly one place that knows how the pieces fit: this one.
//
// Split from `server.ts` on purpose. Building the graph reaches a real
// PostgreSQL (`createPlatformFacade` connects the Chat SDK state before it
// resolves) and listening on a port reaches the network; keeping them in one
// function would mean neither could be exercised without the other. Here the
// two hard edges -- the storage client and the platform facade -- arrive as
// parameters with real defaults, so the wiring itself is provable without
// either.

import type { ChannelRef } from '@growi/chat';

import {
  CONNECTION_UNIT_TABLE,
  REQUIRES_INBOUND_REACHABILITY,
} from '../capabilities/index.js';
import {
  type AdminActorRoles,
  createArgumentCollector,
} from '../command/index.js';
import {
  createChannelPermissionRepository,
  createInstallationChannelRepository,
  createInstallationRepository,
  createOwnKeyRepository,
  createPairingOrderRepository,
  createPeerKeyRepository,
  createPendingCollectionRepository,
  createPrismaClient,
  createProcessedNotificationRepository,
  createRelationRepository,
  createRequestNonceRepository,
  type PrismaClient,
} from '../db/index.js';
import { createFanOutCollector, createGrowiClient } from '../growi/index.js';
import {
  createAdminFlow,
  createCommandFlow,
  createEventSink,
  createInboundFlow,
} from '../orchestration/index.js';
import {
  createInstallationProvider,
  createInstallationStore,
  createPlatformFacade,
  type InstallationStore,
  type InstallationStoreDeps,
  type PlatformFacade,
  refreshChannelInventory,
} from '../platform/index.js';
import {
  createGrowiSelector,
  createGrowiUriResolver,
  createPairingService,
  createRelationKeyService,
} from '../relation/index.js';
import type { RoutesAppDeps, SignatureGuardDeps } from '../routes/index.js';
import type { PlatformEvent, PlatformEventSink } from '../types/index.js';
import type { ProxyConfig } from './config.js';
import {
  ensureMattermostInstallations,
  type MattermostInstallationFailure,
} from './mattermost-installations.js';

/**
 * A sink that can be handed out before the flows behind it exist.
 *
 * The graph has one knot in it: `createPlatformFacade` needs the sink its
 * events go to, while the flow that handles those events needs the facade to
 * post through. Something has to be handed over unfinished, and this is the
 * smaller of the two -- a sink forwards, a facade is used for its answers.
 *
 * An event that arrives before `attach` is refused rather than dropped: the
 * window closes within the same startup, so an event inside it means a
 * connection opened earlier than the wiring expects, which is worth a loud
 * failure rather than a message the user never gets an answer to.
 */
export interface DeferredEventSink {
  readonly sink: PlatformEventSink;
  readonly attach: (target: PlatformEventSink) => void;
}

export const createDeferredEventSink = (): DeferredEventSink => {
  let attached: PlatformEventSink | null = null;
  return {
    sink: {
      handle: async (event: PlatformEvent) => {
        if (attached == null) {
          throw new Error(
            `the proxy is not ready to handle chat events yet (received a ${event.kind} on ${event.platform} before startup finished)`,
          );
        }
        await attached.handle(event);
      },
    },
    attach: (target) => {
      attached = target;
    },
  };
};

/** What this app reports outward while it runs. See {@link ProxyReporters}. */
export interface ProxyReporters {
  /**
   * An OAuth callback that could not be completed, a channel inventory that
   * could not be refreshed, a declared Mattermost server that could not be
   * stored -- each of them a fact the operator has to see, on a path that has
   * otherwise already answered its caller.
   *
   * This app has no logger of its own: every layer reports outward as a
   * function its caller supplied, and this is where those functions end.
   * Writing to the process's own error stream is the outermost layer's
   * business, and nowhere else's.
   */
  readonly reportOperationalFailure: (message: string, error?: unknown) => void;
}

const defaultReporters: ProxyReporters = {
  reportOperationalFailure: (message, error) => {
    // biome-ignore lint/suspicious/noConsole: the process shell is the one place that may write to stderr; every inner layer reports through an injected function instead.
    console.error(`[chat-integration-proxy] ${message}`, error ?? '');
  },
};

/** The two edges that reach outside this process, and the reporters. */
export interface ProxyDependencyOverrides {
  readonly createDb?: (databaseUrl: string) => PrismaClient;
  readonly createFacade?: typeof createPlatformFacade;
  readonly createInstallationStore?: (
    deps: InstallationStoreDeps,
  ) => Pick<InstallationStore, 'save'>;
  readonly reporters?: ProxyReporters;
}

export interface ProxyDependencies {
  readonly routes: RoutesAppDeps;
  readonly facade: PlatformFacade;
  /**
   * Gives back everything startup opened, in the order that keeps work in
   * flight whole: the chat and state connections first, this app's storage
   * last.
   */
  readonly shutdown: () => Promise<void>;
}

/**
 * Builds every dependency the HTTP endpoints and the chat connections need,
 * and answers them together with the way to give them back.
 *
 * Does NOT start reconciling connections and does NOT listen on a port --
 * `server.ts` does both, so that "the graph is built" and "the process is
 * serving" stay separately observable.
 */
export const createProxyDependencies = async (
  config: ProxyConfig,
  overrides: ProxyDependencyOverrides = {},
): Promise<ProxyDependencies> => {
  const {
    createDb = createPrismaClient,
    createFacade = createPlatformFacade,
    createInstallationStore: buildInstallationStore = createInstallationStore,
    reporters = defaultReporters,
  } = overrides;
  const { cipher } = config;

  const db = createDb(config.databaseUrl);

  const relations = createRelationRepository(db);
  const installations = createInstallationRepository(db, cipher);
  const channels = createInstallationChannelRepository(db);
  const ownKeys = createOwnKeyRepository(db, cipher);
  const peerKeys = createPeerKeyRepository(db);
  const channelPermissions = createChannelPermissionRepository(db);
  const pendingCollections = createPendingCollectionRepository(db);
  const processedNotifications = createProcessedNotificationRepository(db);
  const pairingOrders = createPairingOrderRepository(db);
  const requestNonces = createRequestNonceRepository(db);

  const deferred = createDeferredEventSink();
  const facade = await createFacade(
    config.platformApp,
    createInstallationProvider(installations),
    deferred.sink,
  );

  const installationStore = buildInstallationStore({
    installations,
    relations,
    ownKeys,
    peerKeys,
    channelPermissions,
    pendingCollections,
    processedNotifications,
    pairingOrders,
    channels,
    refreshChannels: (installationId) =>
      refreshChannelInventory(
        {
          listChannels: (id) => facade.listChannels(id),
          channels,
          installations,
          now: () => new Date(),
        },
        installationId,
      ),
    onChannelRefreshFailed: (failure) =>
      reporters.reportOperationalFailure(
        `the channel inventory of installation ${failure.installationId} could not be refreshed; the periodic refresh will retry`,
        failure.error,
      ),
  });

  // Declared installations exist before anything reconciles connections: an
  // installation row is what `ConnectionManager` counts when it decides which
  // Mattermost servers to dial (design.md's installation-entry table).
  await ensureMattermostInstallations({
    store: installationStore,
    declared: config.mattermostInstallations,
    onFailed: (failure: MattermostInstallationFailure) =>
      reporters.reportOperationalFailure(
        `the declared Mattermost installation for workspace ${failure.workspaceId} could not be stored; it will not be connected`,
        failure.error,
      ),
  });

  /**
   * The gap `CommandFlowDeps` and `AdminFlowDeps` both leave open, filled once
   * and handed to both ("the same gap, filled once"). A `ChannelRef` names the
   * service and the channel but no installation, so the saved channel
   * inventory is what turns one into the other.
   */
  const resolveInstallationId = async (
    channel: ChannelRef,
  ): Promise<string | null> => {
    const candidates = await installations.listByPlatform(channel.platform);
    for (const candidate of candidates) {
      // biome-ignore lint/performance/noAwaitInLoops: stops at the first match, exactly as `locateInstallation` does in platform/index.ts
      const found = await channels.find(
        candidate.installationId,
        channel.channelId,
      );
      if (found != null) return candidate.installationId;
    }
    return null;
  };

  /**
   * Nothing in this app can observe an actor's roles on a chat service yet:
   * `capabilities/admin-check.ts` declares WHICH field each service's answer
   * is read from, but no layer makes the call, and this layer structurally
   * cannot -- the Chat SDK may only be named inside `platform/`.
   *
   * `null` is the honest answer for "could not be observed", which `AdminFlow`
   * already separates from "is not an admin" and refuses, telling the operator
   * this proxy could not read their roles. Answering anything else here would
   * mean inventing an authorization result.
   */
  const observeActorRoles = async (): Promise<AdminActorRoles | null> => null;

  const uriResolver = createGrowiUriResolver({
    closedNetwork: config.closedNetwork,
  });
  const keyService = createRelationKeyService({ db, cipher });
  const growiClient = createGrowiClient({ uriResolver, keyService });
  const pairingService = createPairingService({ db, cipher, uriResolver });
  const collector = createArgumentCollector({
    pendingCollections,
    platform: facade,
  });

  const adminFlow = createAdminFlow({
    db,
    platform: facade,
    pairing: pairingService,
    keyService,
    growiClient,
    resolveInstallationId,
    observeActorRoles,
  });

  const commandFlow = createCommandFlow({
    platform: facade,
    selector: createGrowiSelector({ db }),
    collector,
    growiClient,
    fanOutCollector: createFanOutCollector({ growiClient }),
    resolveInstallationId,
    adminFlow,
  });

  // The knot is tied here, before anything is served or connected.
  deferred.attach(createEventSink({ collector, flow: commandFlow }));

  const inboundFlow = createInboundFlow({ db, cipher, platform: facade });

  const signature: SignatureGuardDeps = {
    resolvePublicKey: (ref) => peerKeys.findPublicKey(ref, new Date()),
    consumeNonce: requestNonces.consumeNonce,
    recordFailure: (failure, ctx) => {
      // The kind of failure and which endpoint it arrived at, and nothing
      // else: the umbrella spec's Security Considerations keep the signature
      // and the body out of what is kept.
      reporters.reportOperationalFailure(
        `a signed request to ${ctx.method} ${ctx.path} was refused: ${failure}`,
      );
      return Promise.resolve();
    },
  };

  const routes: RoutesAppDeps = {
    notification: { signature, inboundFlow },
    key: { signature, inboundFlow },
    read: {
      signature,
      relations,
      installations,
      channels,
      connections: facade.connections(),
      units: CONNECTION_UNIT_TABLE,
    },
    pairing: { pairingService, uriResolver },
    install: {
      appConfig: config.platformApp,
      installations: installationStore,
      onInstallFailed: (failure) =>
        reporters.reportOperationalFailure(
          `an installation callback for ${failure.platform} could not be completed: ${failure.reason}`,
        ),
      redirectUri: config.oauthRedirectUri,
    },
    webhook: { platform: facade },
    reachability: REQUIRES_INBOUND_REACHABILITY,
  };

  return {
    routes,
    facade,
    shutdown: async () => {
      try {
        await facade.shutdown();
      } catch (error) {
        // Reported, not rethrown: storage still has to be let go of, and a
        // socket that will not close must not leave a connection behind it.
        reporters.reportOperationalFailure(
          'the chat connections could not be closed cleanly',
          error,
        );
      }
      await db.$disconnect();
    },
  };
};
