// This layer's public entry point -- 「この層の入口もここでまとめる」
// (tasks.md 3.8). Everything the rest of the app may see of `platform/` is
// exported from this file, and nothing exported from here names a Chat SDK
// type: that is the condition design.md puts on being able to forbid `chat` /
// `@chat-adapter/*` outside `platform/**` without a single exception.
//
// Deliberately NOT re-exported, each because its type names an SDK value:
// `bot-factory.ts`'s `AppBot` / `createAppBot` / `createInstallationBot`
// (`ChatInstance`, `PostgresStateAdapter`), `prompt.ts`'s `ModalOpener` /
// `ModalTriggerRegistry` (`ModalElement`), `outbound.ts`'s `OutboundContext` /
// `toPostable` / `channelThreadId` (`Adapter`, `StateAdapter`,
// `AdapterPostableMessage`), `history.ts`'s `HistoryContext`,
// `event-handlers.ts`'s `HandlerHost`, and `event-mapping.ts` in full.
// `index.spec.ts` asserts the export list rather than trusting this comment.
import type {
  ChannelInventory,
  ChannelRef,
  ChatAccountRef,
  MessageRef,
  PlatformName,
} from '@growi/chat';
import { type Adapter, Chat, type StateAdapter } from 'chat';

import { CONNECTION_UNIT_TABLE } from '../capabilities/index.js';
import type {
  DistributedLock,
  HistoryOutcome,
  InteractionRef,
  ModalForm,
  OutboundMessage,
  PlatformAppConfig,
  PlatformEventSink,
  PostOutcome,
  TimeRange,
} from '../types/index.js';
import {
  ADAPTER_FACTORIES,
  createAppAdapters,
  createChatState,
  createInstallationAdapter,
} from './adapter-set.js';
import { BOT_USER_NAME, createDistributedLock } from './bot-factory.js';
import { CHANNEL_LISTERS, listChannels as listChannelsOf } from './channels.js';
import {
  type ConnectionManager,
  type ConnectionUnitRef,
  createConnectionManager,
} from './connection-manager.js';
import { registerEventHandlers } from './event-handlers.js';
import { fetchHistory as fetchHistoryOf } from './history.js';
import type { InstallationProvider } from './installation-provider.js';
import {
  attachPreview as attachPreviewOf,
  postEphemeral as postEphemeralOf,
  post as postOf,
  replace as replaceOf,
} from './outbound.js';
import {
  createModalTriggerRegistry,
  type ModalTriggerRegistry,
  openModal as openModalOf,
} from './prompt.js';
import { webhookOptionsFor } from './webhook-options.js';

/**
 * The only thing the rest of the app calls the Chat SDK through. Every
 * parameter and every result is one of this app's own types (design.md's
 * invariant: 「platform 層の出入口に Chat SDK の型を含めない」).
 */
export interface PlatformFacade {
  post(target: ChannelRef, message: OutboundMessage): Promise<PostOutcome>;
  postEphemeral(
    target: ChannelRef,
    user: ChatAccountRef,
    message: OutboundMessage,
  ): Promise<PostOutcome>;
  /**
   * Opens a modal; the submission arrives later as a `modal-submit` event.
   * Answers whether it opened, so a caller can fall back to asking in the
   * channel -- which is an ordinary outcome, not a fault.
   */
  openModal(
    trigger: InteractionRef,
    form: ModalForm,
    correlationId: string,
  ): Promise<boolean>;
  /** One installation's channels. Called on a schedule, not per notification. */
  listChannels(installationId: string): Promise<ChannelInventory>;
  attachPreview(
    target: MessageRef,
    preview: OutboundMessage,
  ): Promise<PostOutcome>;
  fetchHistory(target: ChannelRef, range: TimeRange): Promise<HistoryOutcome>;
  /** Replaces an already-posted message, for answers that outlive the deadline. */
  replace(
    message: MessageRef,
    replacement: OutboundMessage,
  ): Promise<PostOutcome>;
  /** The way in for a service that dials this proxy rather than the reverse. */
  webhookHandler(
    platform: PlatformName,
  ): (request: Request) => Promise<Response>;
  connections(): ConnectionManager;
  locks(): DistributedLock;
}

/**
 * The four services, from the one place that declares them (`ADAPTER_FACTORIES`
 * has one entry per `PlatformName`, checked at compile time). `Object.keys`
 * always widens to `string[]`, so this narrows back rather than claiming
 * anything the table does not already guarantee -- the same step
 * `bot-factory.ts` takes.
 */
const PLATFORM_NAMES = Object.keys(
  ADAPTER_FACTORIES,
) as ReadonlyArray<PlatformName>;

/** One configured service: its adapter, and the bot its events are routed to. */
interface PlatformBot {
  readonly platform: PlatformName;
  readonly adapter: Adapter;
  readonly chat: Chat;
}

/**
 * Message shown when an operation cannot be addressed at a service.
 *
 * Reached in two ways, both of which are configuration rather than a chat
 * failure: the service was never configured, and -- for a service connected
 * per installation -- more than one installation is open, so the channel alone
 * does not say which server to talk to.
 */
const unaddressable = (platform: PlatformName): string =>
  `no open ${platform} connection can serve this request`;

/**
 * Builds one Chat instance per adapter rather than one holding all of them.
 *
 * The SDK initializes **every** adapter of an instance together, lazily, on
 * the first webhook it handles (`Chat.ensureInitialized`). Sharing one
 * instance would therefore let an inbound Teams request start Slack's Socket
 * Mode connection without `app:slack` ever being acquired -- silently undoing
 * the very thing `ConnectionManager` exists to guarantee. One instance per
 * adapter keeps that lazy start scoped to the service the request arrived for.
 *
 * They share one state adapter on purpose: the distributed lock, the event
 * de-duplication and the per-thread locks must all contend in one key space.
 */
const createPlatformBot = (
  platform: PlatformName,
  adapter: Adapter,
  state: StateAdapter,
  deps: {
    readonly sink: PlatformEventSink;
    readonly modals: ModalTriggerRegistry;
  },
): PlatformBot => {
  const chat = new Chat({
    adapters: { [platform]: adapter },
    state,
    userName: BOT_USER_NAME,
  });
  registerEventHandlers(chat, deps);
  return { platform, adapter, chat };
};

export const createPlatformFacade = async (
  appConfig: PlatformAppConfig,
  installations: InstallationProvider,
  sink: PlatformEventSink,
): Promise<PlatformFacade> => {
  // `PostgresStateAdapter` does not connect lazily -- every one of its methods
  // throws until `connect()` has resolved -- which is why this function is
  // asynchronous (design.md).
  const state = createChatState(appConfig);
  await state.connect();

  const locks = createDistributedLock(state);
  const modals = createModalTriggerRegistry();
  const handlerDeps = { sink, modals };

  const appAdapters = createAppAdapters(appConfig, ADAPTER_FACTORIES);
  // Walked over the declared services rather than over the built map's own
  // keys: `Object.entries` widens them to `string`, and narrowing them back
  // would assert something the walk gives for free.
  const appBots = new Map<PlatformName, PlatformBot>(
    PLATFORM_NAMES.flatMap((platform) => {
      const adapter = appAdapters[platform];
      return adapter == null
        ? []
        : [
            [
              platform,
              createPlatformBot(platform, adapter, state, handlerDeps),
            ] as const,
          ];
    }),
  );

  /** Open per-installation connections, keyed by installation id. */
  const installationBots = new Map<string, PlatformBot>();

  /**
   * A service is served here when its adapter is built from the app's own
   * configuration and that configuration exists, or when it is built per
   * installation -- in which case how many connections it needs follows from
   * the installations themselves, and is `ConnectionManager`'s question.
   */
  const platforms = PLATFORM_NAMES.filter(
    (platform) =>
      ADAPTER_FACTORIES[platform].credentialSource === 'installation' ||
      appBots.has(platform),
  );

  const locateInstallation = async (
    installationId: string,
  ): Promise<{ platform: PlatformName; workspaceId: string } | null> => {
    for (const platform of PLATFORM_NAMES) {
      // biome-ignore lint/performance/noAwaitInLoops: stops at the first match
      const listed = await installations.list(platform);
      const found = listed.find(
        (installation) => installation.installationId === installationId,
      );
      if (found != null) {
        return { platform, workspaceId: found.workspaceId };
      }
    }
    return null;
  };

  const openConnection = async (unit: ConnectionUnitRef): Promise<void> => {
    if (unit.installationId == null) {
      const bot = appBots.get(unit.platform);
      if (bot == null) throw new Error(unaddressable(unit.platform));
      // The adapter, not `Chat.initialize()`: the latter would start every
      // adapter of the instance, and only this one's lock is held.
      await bot.adapter.initialize(bot.chat);
      return;
    }

    const located = await locateInstallation(unit.installationId);
    if (located == null) {
      throw new Error(`installation ${unit.installationId} no longer exists`);
    }
    const credentials = await installations.resolve(
      unit.platform,
      located.workspaceId,
    );
    if (credentials == null) {
      throw new Error(
        `installation ${unit.installationId} carries no ${unit.platform} credentials`,
      );
    }
    const adapter = createInstallationAdapter(
      unit.platform,
      credentials,
      ADAPTER_FACTORIES,
    );
    if (adapter == null) throw new Error(unaddressable(unit.platform));

    const bot = createPlatformBot(unit.platform, adapter, state, handlerDeps);
    await adapter.initialize(bot.chat);
    installationBots.set(unit.installationId, bot);
  };

  const closeConnection = async (unit: ConnectionUnitRef): Promise<void> => {
    const bot =
      unit.installationId == null
        ? appBots.get(unit.platform)
        : installationBots.get(unit.installationId);
    if (unit.installationId != null) {
      installationBots.delete(unit.installationId);
    }
    // Never `Chat.shutdown()`: it disconnects the shared state adapter, which
    // would take the distributed lock and every other connection down with it.
    // `disconnect` is optional -- an adapter that opens nothing has none.
    await bot?.adapter.disconnect?.();
  };

  const connections = createConnectionManager({
    platforms,
    units: CONNECTION_UNIT_TABLE,
    installations,
    locks,
    open: openConnection,
    close: closeConnection,
  });

  /**
   * The adapter to address a service through. A per-installation service has
   * one adapter per open connection, and a `ChannelRef` names no installation,
   * so it can only be answered while exactly one is open -- see
   * `unaddressable`.
   */
  const adapterFor = (platform: PlatformName): Adapter | null => {
    if (ADAPTER_FACTORIES[platform].credentialSource === 'app') {
      return appBots.get(platform)?.adapter ?? null;
    }
    const open = [...installationBots.values()].filter(
      (bot) => bot.platform === platform,
    );
    return open.length === 1 ? (open[0]?.adapter ?? null) : null;
  };

  const outboundContext = (platform: PlatformName) => {
    const adapter = adapterFor(platform);
    return adapter == null ? null : { adapter, state, botName: BOT_USER_NAME };
  };

  const notAddressable = (platform: PlatformName): PostOutcome => ({
    ok: false,
    reason: 'platform-error',
    detail: unaddressable(platform),
  });

  return {
    async post(target, message) {
      const context = outboundContext(target.platform);
      if (context == null) return notAddressable(target.platform);
      return await postOf(context, target, message);
    },

    async postEphemeral(target, user, message) {
      const context = outboundContext(target.platform);
      if (context == null) return notAddressable(target.platform);
      return await postEphemeralOf(context, target, user, message);
    },

    openModal(trigger, form, correlationId) {
      return openModalOf(modals, trigger, form, correlationId);
    },

    async listChannels(installationId) {
      const located = await locateInstallation(installationId);
      if (located == null) {
        throw new Error(`unknown installation ${installationId}`);
      }
      const credentials = await installations.resolve(
        located.platform,
        located.workspaceId,
      );
      if (credentials == null) {
        throw new Error(
          `installation ${installationId} carries no ${located.platform} credentials`,
        );
      }
      return listChannelsOf(
        located.platform,
        {
          workspaceId: located.workspaceId,
          credentials,
          appConfig,
          fetch,
        },
        CHANNEL_LISTERS,
      );
    },

    async attachPreview(target, preview) {
      const context = outboundContext(target.channel.platform);
      if (context == null) return notAddressable(target.channel.platform);
      return await attachPreviewOf(context, target, preview);
    },

    async fetchHistory(target, range) {
      const adapter = adapterFor(target.platform);
      if (adapter == null) {
        return {
          ok: false,
          reason: 'unsupported',
          remedy: unaddressable(target.platform),
        };
      }
      return await fetchHistoryOf({ adapter }, target, range);
    },

    async replace(message, replacement) {
      const context = outboundContext(message.channel.platform);
      if (context == null) return notAddressable(message.channel.platform);
      return await replaceOf(context, message, replacement);
    },

    webhookHandler(platform) {
      return async (request) => {
        const handler = appBots.get(platform)?.chat.webhooks[platform];
        if (handler == null) {
          return new Response(unaddressable(platform), { status: 404 });
        }
        // Awaited rather than deferred: `webhookOptionsFor` explains why the
        // modal path has to finish inside the response cycle.
        return await handler(request, webhookOptionsFor(platform));
      };
    },

    connections: () => connections,
    locks: () => locks,
  };
};

export type { ChannelRefreshDeps } from './channels.js';
export { refreshChannelInventory } from './channels.js';
export type {
  ConnectionManager,
  ConnectionState,
  ConnectionStatusRow,
} from './connection-manager.js';
export {
  LOCK_TTL_MS,
  RECONCILE_INTERVAL_MS,
  toConnectionStatusViews,
} from './connection-manager.js';
export type { InstallationProvider } from './installation-provider.js';
export { createInstallationProvider } from './installation-provider.js';
export type {
  ChannelRefreshFailure,
  InstallationStore,
  InstallationStoreDeps,
} from './installation-store.js';
export { createInstallationStore } from './installation-store.js';
// Only the names `routes/install-routes.ts` actually needs. The rest of
// `oauth-callback.ts` (`OAuthCallbackDeps`, `OAuthExchangeContext`,
// `OAuthInstallation`, `OAuthCallbackResult`, `OAuthExchange`) has no caller
// outside this layer and stays unpublished -- `.claude/rules/coding-style.md`,
// "re-export only what callers need".
export type {
  OAuthCallbackFailureReason,
  OAuthExchangeTable,
} from './oauth-callback.js';
export { completeOAuthCallback, OAUTH_EXCHANGES } from './oauth-callback.js';
