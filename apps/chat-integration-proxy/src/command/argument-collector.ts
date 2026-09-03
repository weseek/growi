// Collecting the values a command needs, and resuming once the user supplies
// them (design.md's 「引数の収集 -- 待つ関数として作らない」 and its
// `ArgumentCollector` interface).
//
// Nothing here waits. A modal submission and an answer typed in the channel
// both arrive as a SEPARATE, LATER `PlatformEvent`, possibly on another proxy
// process, so the half-finished collection lives in `pending_collection` and
// every event is resumed from storage rather than from a promise held in
// memory.
//
// Three ways in, chosen by the capability table -- never by a platform name
// (design.md's 「サービス名で分岐せず、能力表を読んで決める」):
//
//   1. the command line itself (`Invocation.argsText`),
//   2. a modal, when `supports(platform, 'modal')` AND the invocation carries
//      a still-usable trigger,
//   3. follow-up questions posted as ephemeral messages.
//
// Path 1 is not an optimization for the platforms that lack modals: it is what
// the capability table's 「無いときの代わり」 column declares as the substitute
// for `modal` ("コマンド行の引数 + 聞き返し"), and `types/invocation.ts` names
// this component as what turns `argsText` into per-`FieldSpec` values. It runs
// FIRST on every platform because `ModalForm` (`{ title, fields }`) has no way
// to carry an already-known value: a modal can only ask for every field again,
// so a user who typed a complete command line must not be shown one.
import { supports } from '../capabilities/index.js';
import type {
  PendingCollectionRecord,
  PendingCollectionRepository,
} from '../db/index.js';
import type { PlatformFacade } from '../platform/index.js';
import type {
  FieldSpec,
  Invocation,
  OutboundMessage,
  PlatformEvent,
} from '../types/index.js';
import { stripAddressToken } from './invocation.js';

export type StartOutcome =
  | {
      readonly status: 'collected';
      readonly values: Readonly<Record<string, string>>;
    }
  | { readonly status: 'pending'; readonly correlationId: string }
  | { readonly status: 'unavailable'; readonly reason: string };

export type ResumeOutcome =
  | {
      readonly status: 'collected';
      readonly values: Readonly<Record<string, string>>;
      readonly invocation: Invocation;
    }
  | { readonly status: 'pending' }
  | { readonly status: 'cancelled' | 'expired' | 'not-mine' };

export interface ArgumentCollector {
  start(
    invocation: Invocation,
    fields: ReadonlyArray<FieldSpec>,
  ): Promise<StartOutcome>;
  resume(event: PlatformEvent): Promise<ResumeOutcome>;
  sweepExpired(now: Date): Promise<number>;
}

/**
 * The two facade methods this component uses. Narrowed with `Pick` rather
 * than taking the whole `PlatformFacade` so a caller can see, from the type
 * alone, that collecting arguments never posts to a channel, opens a
 * connection, or reads history.
 */
export type ArgumentCollectorPlatform = Pick<
  PlatformFacade,
  'openModal' | 'postEphemeral'
>;

export interface ArgumentCollectorDeps {
  readonly pendingCollections: PendingCollectionRepository;
  readonly platform: ArgumentCollectorPlatform;
  /** Injected so a test can fix the clock; production passes nothing. */
  readonly now?: () => Date;
  readonly newCorrelationId?: () => string;
  readonly ttlMs?: number;
}

/**
 * How long a half-finished collection stays resumable. design.md fixes no
 * number, so this is a judgement: long enough that a user who steps away
 * mid-answer comes back to a live conversation, short enough that a forgotten
 * one does not sit in the table (and does not keep blocking that user's next
 * command in the same channel) for the rest of the day. `sweepExpired` is what
 * actually reaps them.
 */
export const PENDING_COLLECTION_TTL_MS = 15 * 60 * 1000;

/**
 * The `collected` column's shape for a collection THIS component owns.
 *
 * `collected` is an opaque JSON column shared with whoever else writes a
 * pending collection (a GROWI choice, from a later task), so the marker is
 * what tells a row of ours apart from a row of theirs: `resume` answers
 * `not-mine` for anything that does not parse as this shape, instead of
 * misreading someone else's row as an unfinished argument collection.
 *
 * `fields` is stored rather than re-derived from `COMMAND_TRAITS` because
 * `start` takes the field list as an ARGUMENT (it must also serve `link` and
 * the admin words, which are not in that table), so the list a collection was
 * started with is the only list its resumption may use.
 */
const STATE_MARKER = 'argument-collection';

interface CollectionState {
  readonly marker: typeof STATE_MARKER;
  readonly fields: ReadonlyArray<FieldSpec>;
  readonly values: Readonly<Record<string, string>>;
  /** The field a follow-up question is outstanding for; `null` under a modal. */
  readonly awaiting: string | null;
}

const isCollectionState = (value: unknown): value is CollectionState =>
  typeof value === 'object' &&
  value !== null &&
  (value as { marker?: unknown }).marker === STATE_MARKER;

/**
 * Fills the declared fields from the command line, positionally: each field
 * takes one whitespace-delimited token, except the last one -- and any
 * `multiline` field, which can only be last for the same reason -- which takes
 * the whole remainder so that a body or a search phrase keeps its spaces.
 *
 * Deliberately no quoting or `key=value` syntax: every command declared in
 * `command-set.ts` ends in the one field that wants free text, so a quoting
 * rule would only add a way for a user to get the escaping wrong.
 */
const parseArgsText = (
  argsText: string,
  fields: ReadonlyArray<FieldSpec>,
): Readonly<Record<string, string>> => {
  const values: Record<string, string> = {};
  let rest = argsText.trim();

  fields.forEach((field, index) => {
    if (rest === '') return;
    const takesRest = index === fields.length - 1 || field.kind === 'multiline';
    if (takesRest) {
      values[field.name] = rest;
      rest = '';
      return;
    }
    const match = /\s+/.exec(rest);
    if (match == null) {
      values[field.name] = rest;
      rest = '';
      return;
    }
    values[field.name] = rest.slice(0, match.index);
    rest = rest.slice(match.index + match[0].length).trim();
  });

  return values;
};

const firstMissingField = (
  fields: ReadonlyArray<FieldSpec>,
  values: Readonly<Record<string, string>>,
): FieldSpec | undefined =>
  fields.find(
    (field) => field.required && (values[field.name] ?? '').trim() === '',
  );

/**
 * The wording of the notice that a half-finished collection was thrown away.
 * It names the discarded command, because the user may well have several in
 * mind: 「取り消しました」 alone leaves them guessing WHICH input is gone.
 */
const discardNoticeFor = (commandName: string): OutboundMessage => ({
  kind: 'markdown',
  markdown: `前の \`${commandName}\` コマンドの入力は取り消しました。`,
});

/** The wording of one follow-up question, built from the same `FieldSpec`. */
const questionFor = (field: FieldSpec): OutboundMessage => ({
  kind: 'markdown',
  markdown: `${field.label} を入力してください。この投稿に返信せず、bot に呼びかけて（例: \`@growi <入力>\`）お答えください。`,
});

export const createArgumentCollector = (
  deps: ArgumentCollectorDeps,
): ArgumentCollector => {
  const {
    pendingCollections,
    platform,
    now = () => new Date(),
    newCorrelationId = () => crypto.randomUUID(),
    ttlMs = PENDING_COLLECTION_TTL_MS,
  } = deps;

  /**
   * Posts the next question and records what it asked for. Answers whether it
   * could be asked at all: an ephemeral message is the only way this component
   * has of reaching the user (design.md's capability table notes 「聞き返し」
   * rests on `ephemeralMessage`), so a service that cannot post one -- or a
   * channel the bot is not in -- means the values cannot be collected.
   */
  const ask = async (
    invocation: Invocation,
    correlationId: string,
    state: CollectionState,
    field: FieldSpec,
  ): Promise<StartOutcome> => {
    if (!supports('ephemeralMessage', invocation.platform)) {
      return {
        status: 'unavailable',
        reason:
          'このチャットサービスでは、値を聞き返す手段がないため、このコマンドを実行できません。',
      };
    }

    const posted = await platform.postEphemeral(
      invocation.channel,
      invocation.actor,
      questionFor(field),
    );
    if (!posted.ok) {
      return {
        status: 'unavailable',
        reason:
          posted.reason === 'bot-not-in-channel'
            ? posted.remedy
            : posted.detail,
      };
    }

    await pendingCollections.update(correlationId, {
      collected: { ...state, awaiting: field.name },
    });
    return { status: 'pending', correlationId };
  };

  /**
   * Everything `start` does once it knows the command line alone was not
   * enough: the row exists BEFORE the modal is opened, because the submission
   * may reach a different process than the one that opened it.
   */
  const beginPending = async (
    invocation: Invocation,
    fields: ReadonlyArray<FieldSpec>,
    values: Readonly<Record<string, string>>,
    missing: FieldSpec,
  ): Promise<StartOutcome> => {
    const correlationId = newCorrelationId();
    const state: CollectionState = {
      marker: STATE_MARKER,
      fields,
      values,
      awaiting: null,
    };

    await pendingCollections.create({
      correlationId,
      platform: invocation.platform,
      channelId: invocation.channel.channelId,
      actorAccountId: invocation.actor.accountId,
      commandName: invocation.commandName,
      invocation,
      collected: state,
      offeredOptions: [],
      expiresAt: new Date(now().getTime() + ttlMs),
    });

    // Both halves of design.md's condition in one check: the table says the
    // service can, AND this invocation carries a trigger. A trigger that has
    // since expired is only knowable by trying, which is why `openModal`
    // answers a boolean instead of throwing.
    const trigger = supports('modal', invocation.platform)
      ? invocation.interaction
      : null;
    if (trigger != null) {
      const opened = await platform.openModal(
        trigger,
        { title: invocation.commandName, fields },
        correlationId,
      );
      if (opened) return { status: 'pending', correlationId };
    }

    const outcome = await ask(invocation, correlationId, state, missing);
    if (outcome.status === 'unavailable') {
      // Nothing can advance this collection, and leaving it would block the
      // user's next command in this channel until it expired.
      await pendingCollections.remove(correlationId);
    }
    return outcome;
  };

  /**
   * Applies newly supplied values to a stored collection: finishes it, or asks
   * the next question. Shared by both resumption paths so a modal submission
   * that left a required field empty falls back to the same questions.
   */
  const advance = async (
    correlationId: string,
    invocation: Invocation,
    state: CollectionState,
    supplied: Readonly<Record<string, string>>,
  ): Promise<ResumeOutcome> => {
    const values = { ...state.values, ...supplied };
    const missing = firstMissingField(state.fields, values);
    if (missing == null) {
      await pendingCollections.remove(correlationId);
      return { status: 'collected', values, invocation };
    }

    const asked = await ask(
      invocation,
      correlationId,
      { ...state, values },
      missing,
    );
    if (asked.status === 'unavailable') {
      // The collection was this component's (`loadOwn` checked the marker) and
      // it is over without completing: nothing can ask for the rest any more,
      // so the row goes. `not-mine` would be wrong here -- it means "an
      // ordinary message, do nothing" (design.md's mention routing), and the
      // caller would then never learn that a collection it started just ended.
      await pendingCollections.remove(correlationId);
      return { status: 'cancelled' };
    }
    return { status: 'pending' };
  };

  const loadOwn = async (
    correlationId: string,
  ): Promise<
    | {
        readonly kind: 'ok';
        readonly record: PendingCollectionRecord;
        readonly state: CollectionState;
      }
    | { readonly kind: 'not-mine' }
    | { readonly kind: 'expired' }
  > => {
    const record = await pendingCollections.findByCorrelationId(correlationId);
    if (record == null || !isCollectionState(record.collected)) {
      return { kind: 'not-mine' };
    }
    if (record.expiresAt.getTime() <= now().getTime()) {
      await pendingCollections.remove(correlationId);
      return { kind: 'expired' };
    }
    return { kind: 'ok', record, state: record.collected };
  };

  return {
    start: async (invocation, fields) => {
      // design.md's invariant, both halves: 「1 チャンネル・1 利用者につき
      // 同時に 1 件。新しいコマンドが始まったら古いものを破棄し、破棄したことを
      // 利用者に示す」. Whatever wrote the in-flight row -- this component
      // or a pending GROWI choice -- a new command supersedes it, and the
      // user is told BEFORE it goes.
      //
      // The notice is posted whatever happens next, including when the new
      // command turns out to be `unavailable` below: the old input is gone
      // either way, and finding that out is exactly what the invariant is
      // for. Its own failure is not reported -- there is no channel left to
      // report it through, and the outcome of the command the user actually
      // typed must not be replaced by it. For the same reason this is the one
      // post that does not consult the capability table first (`ask` does):
      // there is no alternative way of saying this and nothing to decide
      // between, so asking the table could only turn one ignored failure into
      // another.
      const inFlight = await pendingCollections.findInFlight(
        invocation.platform,
        invocation.channel.channelId,
        invocation.actor.accountId,
      );
      if (inFlight != null) {
        await platform.postEphemeral(
          invocation.channel,
          invocation.actor,
          discardNoticeFor(inFlight.commandName),
        );
        await pendingCollections.remove(inFlight.correlationId);
      }

      const values = parseArgsText(invocation.argsText, fields);
      const missing = firstMissingField(fields, values);
      if (missing == null) return { status: 'collected', values };

      return beginPending(invocation, fields, values, missing);
    },

    resume: async (event) => {
      // A follow-up answer can only arrive as a mention: `reply` was removed
      // from `PlatformEvent` (design.md: 「`plainReply` に依存しない」), so the
      // user answers by addressing the bot again. Which collection it answers
      // is decided by (channel, user), the same key the one-in-flight rule
      // uses -- an answer carries no correlation id of its own.
      if (event.kind === 'mention') {
        const inFlight = await pendingCollections.findInFlight(
          event.platform,
          event.channel.channelId,
          event.actor.accountId,
        );
        if (inFlight == null) return { status: 'not-mine' };

        const loaded = await loadOwn(inFlight.correlationId);
        if (loaded.kind !== 'ok') return { status: loaded.kind };
        if (loaded.state.awaiting == null) return { status: 'not-mine' };

        return advance(
          inFlight.correlationId,
          loaded.record.invocation,
          loaded.state,
          { [loaded.state.awaiting]: stripAddressToken(event.text) },
        );
      }

      if (event.kind === 'modal-submit') {
        const loaded = await loadOwn(event.correlationId);
        if (loaded.kind !== 'ok') return { status: loaded.kind };

        return advance(
          event.correlationId,
          loaded.record.invocation,
          loaded.state,
          event.values,
        );
      }

      if (event.kind === 'action') {
        const loaded = await loadOwn(event.correlationId);
        if (loaded.kind !== 'ok') return { status: loaded.kind };
        // A button that carries no value cannot supply one, and choosing which
        // GROWI to act on is a later component's row (which `loadOwn` has
        // already rejected as not this component's shape).
        if (loaded.state.awaiting == null || event.value == null) {
          return { status: 'not-mine' };
        }

        return advance(
          event.correlationId,
          loaded.record.invocation,
          loaded.state,
          { [loaded.state.awaiting]: event.value },
        );
      }

      // `slash-command` starts a new command (it goes to
      // `CommandInvocation.normalize`) and `link-posted` is not a command at
      // all: neither can continue a collection.
      return { status: 'not-mine' };
    },

    sweepExpired: (at) => pendingCollections.deleteExpired(at),
  };
};
