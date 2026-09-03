// design.md's File Structure Plan for this file: the four outbound operations
// on `PlatformFacade` -- post, post-so-only-one-person-sees-it, attach a
// preview to an existing message, and replace a message already posted.
//
// This is also the one place a proxy-owned `OutboundMessage` becomes a Chat SDK
// Card (design.md: 「Card への変換は `platform/outbound.ts` の中だけで行う」).
// Nothing outside `platform/` may see a Card, which is what lets the layer's
// outward surface stay free of SDK types.
//
// Two rules shape everything below:
//
//  1. **Never throw; always answer.** design.md's postcondition for this layer
//     is 「`post` は例外を投げず、必ず `PostOutcome` を返す（要件 1.4 / 2.4）」.
//     Every SDK call here is wrapped, and a failure the user can act on --
//     the bot was never invited to that channel -- is told apart from every
//     other failure so the caller has a remedy to show.
//  2. **Read the capability table, never the service name, to decide how much
//     of a message a service can render.** The two rows that matter here are
//     `card` and `interactiveActions`; both are declared once in
//     `capabilities/` and consulted through `levelOf` / `supports`.

import type { SlackThreadId } from '@chat-adapter/slack';
import type {
  ChannelRef,
  ChatAccountRef,
  MessageRef,
  PlatformName,
} from '@growi/chat';
import {
  Actions,
  type Adapter,
  type AdapterPostableMessage,
  Button,
  Card,
  type CardElement,
  CardText,
  ChannelImpl,
  Divider,
  type StateAdapter,
} from 'chat';
import type { MattermostThreadId } from 'chat-adapter-mattermost';

import { supports } from '../capabilities/index.js';
import type { OutboundMessage, PostOutcome } from '../types/index.js';
import { encodeActionId } from './event-mapping.js';

/**
 * What an outbound call needs besides its arguments. Passed in rather than
 * looked up here so this module keeps one responsibility -- performing the
 * operation -- and stays exercisable without a live SDK
 * (`.claude/rules/coding-style.md`, "executors take their work-set as input").
 * `platform/index.ts` (task 3.8) is what resolves a `PlatformName` to the
 * adapter serving it.
 */
export interface OutboundContext {
  readonly adapter: Adapter;
  /**
   * The Chat SDK state. Only the card-callback rewriting inside
   * `ChannelImpl.post` reads it; it is required rather than optional because a
   * card is exactly what this module posts on three of the four services.
   */
  readonly state: StateAdapter;
  /**
   * The name a user addresses the bot by. Needed only where a service cannot
   * render buttons and the choice has to be answered by an addressed reply
   * instead (see `choiceToMarkdown`). Passed in because `bot-factory.ts` owns
   * that name.
   */
  readonly botName: string;
}

/**
 * What a user is told when the bot cannot reach a channel. The one failure of
 * the three `PostOutcome` arms that names something the reader can fix, which
 * is why `PostOutcome` carries a `remedy` for it and a `detail` for the rest.
 */
const NOT_IN_CHANNEL_REMEDY =
  'bot がこのチャンネルに参加していません。チャンネルに bot を招待してから、もう一度お試しください。';

// --------------------------------------------------------------------------
// OutboundMessage -> what the SDK posts
// --------------------------------------------------------------------------

/**
 * A row of a `list`, and a `list`'s footer, rendered as plain markdown.
 *
 * Used when `card` is not `full` on the target service -- design.md's
 * capability table gives Mattermost `degraded` with the documented fallback
 * 「markdown で投稿する」. Every row and its source label survives the
 * fallback: what is lost is the card's visual framing, not information.
 */
const listToMarkdown = (
  message: Extract<OutboundMessage, { kind: 'list' }>,
): string =>
  [
    `**${message.title}**`,
    ...message.rows.map((row) => `- ${row.markdown} — ${row.sourceLabel}`),
    ...(message.footer == null ? [] : ['', message.footer]),
  ].join('\n');

const listToCard = (
  message: Extract<OutboundMessage, { kind: 'list' }>,
): CardElement =>
  Card({
    title: message.title,
    children: [
      ...message.rows.flatMap((row) => [
        CardText(row.markdown),
        CardText(row.sourceLabel, { style: 'muted' }),
      ]),
      ...(message.footer == null
        ? []
        : [Divider(), CardText(message.footer, { style: 'muted' })]),
    ],
  });

/**
 * A `choice` rendered as buttons.
 *
 * The correlation id travels inside each button's action id via
 * `encodeActionId()` -- assembling that format by hand here would produce
 * presses nothing can resume (Implementation Note 3.3).
 *
 * No `value` is set, deliberately. `decodeActionId()` already recovers the
 * option's own id from the action id, so a `value` would be a second copy of
 * it -- and a costly one: `@chat-adapter/discord` packs action id and value
 * into one `custom_id` that Discord caps at 100 characters, and rejects the
 * button outright past that. Leaving `value` out roughly halves what a choice
 * spends of that budget.
 */
const choiceToCard = (
  message: Extract<OutboundMessage, { kind: 'choice' }>,
): CardElement =>
  Card({
    children: [
      CardText(message.prompt),
      Actions(
        message.options.map((option) =>
          Button({
            id: encodeActionId(message.correlationId, option.id),
            label: option.label,
          }),
        ),
      ),
    ],
  });

/**
 * A `choice` on a service that cannot render buttons at all
 * (`interactiveActions` is `none` for Mattermost).
 *
 * The options become a numbered list answered by addressing the bot -- the
 * convention design.md settles every follow-up interaction on, because
 * `plainReply` is unverified on all four services (see `bot-factory.ts`'s note
 * on the bot name). The *position* is what the reader replies with, so the
 * order here is the contract with whoever resumes the collection.
 */
const choiceToMarkdown = (
  message: Extract<OutboundMessage, { kind: 'choice' }>,
  botName: string,
): string =>
  [
    message.prompt,
    ...message.options.map((option, index) => `${index + 1}. ${option.label}`),
    '',
    `\`@${botName} 1\` のように番号を付けて返信してください。`,
  ].join('\n');

/**
 * The single conversion from this proxy's own message vocabulary into
 * something an adapter can post.
 *
 * The capability row consulted differs per kind, and deliberately so:
 *
 * - `markdown` asks nothing of the service and is never downgraded.
 * - `list` is a presentation choice, so it follows the `card` row.
 * - `choice` needs its buttons to be *pressable*, so it follows the
 *   `interactiveActions` row. Reading `card` for it would be the wrong
 *   question: a card that renders but whose buttons do nothing leaves the
 *   reader with no way to answer.
 */
export const toPostable = (
  message: OutboundMessage,
  platform: PlatformName,
  botName: string,
): AdapterPostableMessage => {
  switch (message.kind) {
    case 'markdown':
      return { markdown: message.markdown };
    case 'list':
      return supports('card', platform)
        ? listToCard(message)
        : { markdown: listToMarkdown(message) };
    case 'choice':
      return supports('interactiveActions', platform)
        ? choiceToCard(message)
        : { markdown: choiceToMarkdown(message, botName) };
  }
};

// --------------------------------------------------------------------------
// Addressing: a ChannelRef / MessageRef -> the adapter's own thread id
// --------------------------------------------------------------------------

/**
 * How each service's channel id becomes a thread id addressing that same
 * channel, optionally rooted at one message.
 *
 * This is the inverse of `Adapter.channelIdFromThreadId`, which the SDK offers
 * in one direction only -- and the direction this module needs, because
 * `MessageRef` carries a `ChannelRef` and a message id but no thread id, while
 * `editMessage` / `postMessage` are addressed by thread id.
 *
 * Declared as a table for the same reason `ADAPTER_FACTORIES` (`adapter-set.ts`)
 * is one: it states a per-service *fact about id formats*, and every consumer
 * below reads the table instead of branching on a service name. It is not a
 * capability question -- the capability table has no row that could answer it.
 *
 * Verified against the installed adapters:
 * - Slack (`@chat-adapter/slack`): `channelIdFromThreadId` yields `slack:<C>`,
 *   and `decodeThreadId` accepts that two-part form as `threadTs: ''`. Rooting
 *   it means putting the target message's `ts` in `threadTs`.
 * - Discord (`@chat-adapter/discord`): `channelIdFromThreadId` yields the first
 *   three segments, which `decodeThreadId` already accepts as a channel-level
 *   thread id. A Discord "thread" is a separate channel rather than a message,
 *   so a message root is not expressible and the root is ignored.
 * - Teams (`@chat-adapter/teams`): `channelIdFromThreadId` returns an encoded
 *   thread id outright. `TeamsThreadId.replyToId` exists but `encodeThreadId`
 *   does not carry it, so the root is not expressible here either.
 * - Mattermost (`chat-adapter-mattermost`): `channelIdFromThreadId` returns the
 *   bare Mattermost channel id, which is *not* a thread id -- so this is the
 *   one entry that has to re-encode. `rootPostId` expresses the root.
 *
 * Each entry hands the field names to the adapter's own `encodeThreadId`, so
 * the wire format stays the adapter's business, never this file's.
 */
type ChannelAddressing = (
  adapter: Adapter,
  channelId: string,
  rootMessageId: string | null,
) => string;

const CHANNEL_ADDRESSING: Readonly<Record<PlatformName, ChannelAddressing>> = {
  slack: (adapter, channelId, rootMessageId) => {
    const { channel } = adapter.decodeThreadId(channelId) as SlackThreadId;
    return adapter.encodeThreadId({
      channel,
      threadTs: rootMessageId ?? '',
    } satisfies SlackThreadId);
  },
  discord: (_adapter, channelId) => channelId,
  teams: (_adapter, channelId) => channelId,
  mattermost: (adapter, channelId, rootMessageId) =>
    adapter.encodeThreadId({
      channelId,
      rootPostId: rootMessageId ?? undefined,
    } satisfies MattermostThreadId),
};

/**
 * The adapter thread id addressing `channelId`, rooted at `rootMessageId` where
 * the service can express that. Always names the same channel, whether rooted
 * or not.
 */
export const channelThreadId = (
  adapter: Adapter,
  platform: PlatformName,
  channelId: string,
  rootMessageId: string | null,
): string => CHANNEL_ADDRESSING[platform](adapter, channelId, rootMessageId);

// --------------------------------------------------------------------------
// Failures
// --------------------------------------------------------------------------

/**
 * How each service says "this bot cannot post to that channel".
 *
 * Recognised structurally -- by the thrown value's `name` and message -- rather
 * than with `instanceof`, because the error classes live in
 * `@chat-adapter/shared`, which this app does not depend on directly. Adding
 * that dependency to narrow three `if`s would put a second copy of the adapter
 * toolchain in the lockfile for no gain in certainty: `name` is set explicitly
 * by every one of those constructors.
 *
 * Anything not listed here becomes `platform-error`. Being conservative is the
 * right bias: telling a user to invite the bot when the real fault was an
 * expired token sends them to fix something that is not broken.
 */
const NOT_IN_CHANNEL_RECOGNIZERS: ReadonlyArray<(error: Error) => boolean> = [
  // Slack: `chat.postMessage` answers `ok: false` with a named error, which
  // `SlackApiError` carries both in `message` and in `response.error`.
  (error) =>
    error.name === 'SlackApiError' &&
    /\b(not_in_channel|channel_not_found|is_archived|not_in_conversation)\b/.test(
      error.message,
    ),
  // Discord: a non-ok HTTP response becomes `NetworkError` whose message is
  // `Discord API error: <status> <body>`. 403 / 404 and error code 50001
  // ("Missing Access") are the shapes a missing invitation takes.
  (error) =>
    error.name === 'NetworkError' &&
    /Discord API error: (403|404)\b/.test(error.message),
  (error) => error.name === 'NetworkError' && /\b50001\b/.test(error.message),
  // Mattermost and Teams both map HTTP 403 onto `@chat-adapter/shared`'s
  // `PermissionError`, and a missing channel onto `ResourceNotFoundError`.
  (error) =>
    error.name === 'PermissionError' || error.name === 'ResourceNotFoundError',
];

/**
 * Turns whatever an adapter threw into the failure half of a `PostOutcome`.
 * Exported so the classification is testable on its own, and so every
 * operation below shares one answer rather than each inventing its own.
 */
export const classifyOutboundFailure = (
  error: unknown,
): Extract<PostOutcome, { ok: false }> => {
  if (
    error instanceof Error &&
    NOT_IN_CHANNEL_RECOGNIZERS.some((recognizes) => recognizes(error))
  ) {
    return {
      ok: false,
      reason: 'bot-not-in-channel',
      remedy: NOT_IN_CHANNEL_REMEDY,
    };
  }

  return {
    ok: false,
    reason: 'platform-error',
    detail: error instanceof Error ? error.message : String(error),
  };
};

/**
 * The single place the "never throw" postcondition is honoured. Every operation
 * below is `attempt(...)` around one SDK call, so no operation can grow a path
 * that escapes it.
 */
const attempt = async (
  send: () => Promise<{ readonly id: string }>,
): Promise<PostOutcome> => {
  try {
    const sent = await send();
    return { ok: true, messageId: sent.id };
  } catch (error) {
    return classifyOutboundFailure(error);
  }
};

/**
 * The SDK's channel handle for a `ChannelRef`.
 *
 * `post` and `postEphemeral` go through this rather than calling the adapter
 * directly, because `ChannelImpl` already owns two behaviors this module would
 * otherwise have to restate: falling back to `postMessage` when an adapter
 * implements no `postChannelMessage`, and falling back to a direct message when
 * an adapter implements no native ephemeral (Discord's does not, even though
 * design.md's capability table records `ephemeralMessage` as `full` for it).
 * `replace` and `attachPreview` have no `ChannelImpl` equivalent and address the
 * adapter directly.
 */
const channelHandleOf = (
  context: OutboundContext,
  target: ChannelRef,
): ChannelImpl =>
  new ChannelImpl({
    adapter: context.adapter,
    stateAdapter: context.state,
    id: target.channelId,
    // `isDM` is deliberately left at its default. `ChannelRef.isPrivate` is not
    // the same question: `event-mapping.ts` sets it for a private channel as
    // well as for a direct message, so passing it here would tell the SDK that
    // every private channel is a DM.
  });

// --------------------------------------------------------------------------
// The four operations
// --------------------------------------------------------------------------

/**
 * Posts to a channel. On success the returned `messageId` is what a caller
 * pairs with its own `ChannelRef` to build the `MessageRef` that `replace()`
 * takes -- design.md's 「まず『検索しています』を投稿し、その
 * `PostOutcome.messageId` から `MessageRef` を作り、結果が揃ったら `replace()`
 * で差し替える」.
 */
export const post = async (
  context: OutboundContext,
  target: ChannelRef,
  message: OutboundMessage,
): Promise<PostOutcome> =>
  attempt(() =>
    channelHandleOf(context, target).post(
      toPostable(message, target.platform, context.botName),
    ),
  );

/** Posts something only `user` can see in `target`. */
export const postEphemeral = async (
  context: OutboundContext,
  target: ChannelRef,
  user: ChatAccountRef,
  message: OutboundMessage,
): Promise<PostOutcome> =>
  attempt(async () => {
    const sent = await channelHandleOf(context, target).postEphemeral(
      user.accountId,
      toPostable(message, target.platform, context.botName),
      // The point of an ephemeral message is that only this one person sees it;
      // a direct message keeps that true where the platform offers nothing
      // native, whereas refusing would drop the message entirely.
      { fallbackToDM: true },
    );
    if (sent == null) {
      throw new Error(
        `${target.platform} can post neither an ephemeral message nor a direct message`,
      );
    }
    return sent;
  });

/**
 * Posts a preview of what a link points at, next to the message that carried
 * the link (Requirement 6.1).
 *
 * Operationally this differs from `post` in one way: it is addressed at the
 * target message's thread rather than at the channel, so on a service that can
 * root a thread at a message (Slack, Mattermost) the preview appears under that
 * message instead of at the bottom of the channel.
 *
 * No adapter implements the SDK's optional `Adapter.reply()`, so posting into
 * the rooted thread is the whole of what "attach" can mean here. In practice
 * only Slack reaches this at all: `link-posted` is the sole producer of the
 * `MessageRef` it takes, and only the Slack adapter fills `Message.links` in
 * (see `event-mapping.ts`).
 */
export const attachPreview = async (
  context: OutboundContext,
  target: MessageRef,
  preview: OutboundMessage,
): Promise<PostOutcome> =>
  attempt(() =>
    context.adapter.postMessage(
      channelThreadId(
        context.adapter,
        target.channel.platform,
        target.channel.channelId,
        target.messageId,
      ),
      toPostable(preview, target.channel.platform, context.botName),
    ),
  );

/**
 * Replaces a message already posted, editing it in place rather than deleting
 * and re-posting: every adapter implements `editMessage` as an update call
 * (`chat.update`, `PATCH /channels/.../messages/...`, `updateActivity`,
 * `PUT /posts/...`), so the message keeps its position and its permalink.
 *
 * This is the path design.md routes search through, because Slack allows 3
 * seconds for an event and Discord 3 seconds for a first response: the
 * acknowledgement goes out immediately and this replaces it once results are
 * ready.
 */
export const replace = async (
  context: OutboundContext,
  message: MessageRef,
  replacement: OutboundMessage,
): Promise<PostOutcome> =>
  attempt(() =>
    context.adapter.editMessage(
      channelThreadId(
        context.adapter,
        message.channel.platform,
        message.channel.channelId,
        null,
      ),
      message.messageId,
      toPostable(replacement, message.channel.platform, context.botName),
    ),
  );
