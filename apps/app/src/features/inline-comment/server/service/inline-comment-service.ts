/**
 * InlineCommentService — persistence, Activity recording, and mention-notification
 * kickoff for inline comments (design.md: "InlineCommentService").
 *
 * This is the sole write path for `comments` rows with `isInline: true`
 * (design.md: Responsibilities & Constraints). `create()`, `createReply()`,
 * `listByPageId()`, and `setResolved()` (design.md's Service Interface) are
 * all implemented here as sibling methods on this same class.
 */

import type { IPageHasId, IUserHasId } from '@growi/core';
import { serializeUserSecurely } from '@growi/core/dist/models/serializers';
import { Types } from 'mongoose';

import type { Prisma } from '~/generated/prisma/client';
import {
  SupportedAction,
  SupportedEventModel,
  SupportedTargetModel,
} from '~/interfaces/activity';
import type CommentService from '~/server/service/comment';
import loggerFactory from '~/utils/logger';
import type { PrismaClient } from '~/utils/prisma';

import type {
  IInlineComment,
  InlineCommentAnchor,
  InlineCommentReply,
  InlineCommentWithReplies,
} from '../../interfaces';

const logger = loggerFactory('growi:features:inline-comment:service');

// ---------------------------------------------------------------------------
// Service Interface (design.md)
// ---------------------------------------------------------------------------

export interface CreateInlineCommentInput {
  pageId: string;
  anchorOriginRevisionId: string;
  comment: string;
  anchor: InlineCommentAnchor;
}

export interface CreateInlineCommentReplyInput {
  /** The origin (anchored) inline comment this reply is attached to. */
  parentId: string;
  comment: string;
}

// ---------------------------------------------------------------------------
// Dependencies
//
// Per apps/app/.claude/rules/esm-authoring.md ("Services must not import the
// Crowi class"), this service takes its dependencies as a constructor
// argument rather than importing `Crowi` or the shared `prisma` singleton
// directly. `commentService` is typed against the real `CommentService`
// class (type-only import, erased at build — no runtime cycle), so the
// route layer (task 3.5) can pass `crowi.commentService` in unmodified.
//
// `prisma` is typed against the real generated `PrismaClient` (type-only
// import), narrowed with `Pick` to only the two delegates this service uses
// (`comments`, `activities`) rather than hand-written parallel interfaces.
// Row/result shapes below are derived from that same real client type via
// `Prisma.Result<...>` instead of being declared by hand, so they can never
// drift out of structural assignability with what real Prisma returns (see
// `.../audit-log-bulk-export/.../activity-export-cursor.ts` for the same
// pattern applied to `activities`).
// ---------------------------------------------------------------------------

/**
 * The `comments` row shape read back from `create()`'s insert, including the
 * `page` relation (`include: { page: true }`) so the row needed by
 * `prepareMentionNotifications` comes back in the same round trip instead of
 * a second dependency for fetching the page.
 */
type InlineCommentCreateResult = Prisma.Result<
  PrismaClient['comments'],
  { include: { page: true } },
  'create'
>;

/**
 * The `comments` row shape a `createReply()` insert reads back. No `page`
 * relation is pulled in here: `toPageHasId`/`prepareMentionNotifications`
 * need the *parent's* page, which the `findUnique()` parent lookup already
 * returns via its own `include: { page: true }`, so re-fetching it on the
 * reply row would be a redundant round trip.
 */
type InlineCommentReplyCreateResult = Prisma.Result<
  PrismaClient['comments'],
  object,
  'create'
>;

// The `findUnique()` lookup used to validate a `createReply()` `parentId`
// (isInline: true and replyToId: null — i.e. it is itself an origin
// comment) needs no separately-declared row type: its shape is inferred
// directly from `this.deps.prisma.comments.findUnique(...)`'s call-site
// return type, which is already derived from the real `PrismaClient`.

/**
 * The `comments` row shape `listByPageId()`'s two `findMany()` queries
 * (both now requesting `include: { creator: true }`, requirement 13.5) read
 * back — one row shape shared by both the origin-comment query and the
 * replies query. Derived via `Prisma.Result<...>`, matching
 * `InlineCommentCreateResult`'s pattern above, so the row type reflects the
 * `creator` relation the queries now request.
 */
type InlineCommentListRow = Prisma.Result<
  PrismaClient['comments'],
  { include: { creator: true } },
  'findMany'
>[number];

// The `findUnique()` lookup `setResolved()` uses to validate its `id` (must
// be an origin comment — isInline: true and replyToId: null) needs no
// separately-declared row type either, for the same reason as
// `createReply()`'s parent lookup above: its shape is inferred directly from
// the call site.

/**
 * The `comments` row shape `setResolved()`'s `update()` (no `include`) reads
 * back.
 */
type InlineCommentUpdateResult = Prisma.Result<
  PrismaClient['comments'],
  object,
  'update'
>;

export interface InlineCommentServiceDeps {
  prisma: Pick<PrismaClient, 'comments' | 'activities'>;
  commentService: Pick<CommentService, 'prepareMentionNotifications'>;
}

/**
 * The `comments` row shape a reply-targeted `update()` (no `include`) reads
 * back — the reply counterpart of `InlineCommentUpdateResult` above, used by
 * `updateReply()`.
 */
type InlineCommentReplyUpdateResult = Prisma.Result<
  PrismaClient['comments'],
  object,
  'update'
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Adapts a Prisma `pages` row (as returned via `comments.create`'s /
 * `comments.findUnique`'s `include: { page: true }`) to the Mongoose-era
 * `IPageHasId` shape that `CommentService.prepareMentionNotifications` still
 * expects. GROWI's `$allModels` Prisma extension (`~/utils/prisma`) attaches
 * a computed `_id` alias for exactly this kind of legacy-shape compatibility
 * at runtime, but the *type* derived here via `Prisma.Result<...>` for a
 * nested `include`d relation does not reflect that extension's computed
 * field (the extension is applied to the top-level delegate, not to types
 * TypeScript can see through a relation include), so the alias is added
 * explicitly instead of relied upon implicitly.
 */
function toPageHasId(
  page: { id: string } & Record<string, unknown>,
): IPageHasId {
  return { ...page, _id: page.id } as unknown as IPageHasId;
}

function toIInlineComment(row: InlineCommentCreateResult): IInlineComment {
  // create() always writes these fields together (isInline: true rows), so a
  // row it just read back from its own insert is guaranteed to have them.
  if (
    row.creatorId == null ||
    row.quote == null ||
    row.prefix == null ||
    row.suffix == null ||
    row.approxOffset == null ||
    row.anchorOriginRevisionId == null
  ) {
    throw new Error(
      `Inline comment row '${row.id}' is missing required anchor fields`,
    );
  }

  return {
    id: row.id,
    pageId: row.pageId,
    creatorId: row.creatorId,
    // create() requests no `creator` include (see InlineCommentCreateResult's
    // doc) and its response does not need one (design.md: the client
    // re-fetches the list via `mutate()` right after create).
    creator: null,
    comment: row.comment,
    anchorOriginRevisionId: row.anchorOriginRevisionId,
    anchor: {
      quote: row.quote,
      prefix: row.prefix,
      suffix: row.suffix,
      approxOffset: row.approxOffset,
    },
    resolvedById: row.resolvedById,
    resolvedAt: row.resolvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toInlineCommentReply(
  row: InlineCommentReplyCreateResult,
): InlineCommentReply {
  // createReply() always writes creatorId/replyToId together, so a row it
  // just read back from its own insert is guaranteed to have them.
  if (row.creatorId == null || row.replyToId == null) {
    throw new Error(
      `Inline comment reply row '${row.id}' is missing required fields`,
    );
  }

  return {
    id: row.id,
    pageId: row.pageId,
    creatorId: row.creatorId,
    // createReply() does not fetch the creator relation (no include on its
    // insert-and-read-back), same as toIInlineComment() above.
    creator: null,
    comment: row.comment,
    replyToId: row.replyToId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Maps a `listByPageId()` origin-comment row (`InlineCommentListRow`) to the
 * anchor-bearing `IInlineComment` fields — the same fields `toIInlineComment`
 * produces, but for a row that never carried a `page` relation (the
 * `findMany()` this method uses requests no `include`, unlike `create()`'s
 * insert-and-read-back).
 *
 * Returns `null` (rather than throwing) when the row is missing a required
 * anchor field. `listByPageId()`'s query filter (`isInline: true,
 * replyToId: null`) does not itself guarantee these fields are non-null —
 * that is a write-path guarantee (`create()` always writes them together),
 * not a read-side one. A single malformed row (manual DB edit, a future
 * write-path bug, schema drift) must not fail the whole page's comment list
 * for every viewer; skip it and let the rest of the list render, consistent
 * with this feature's degrade-gracefully philosophy (`matchQuote`'s
 * `not_found` fallback, the client's highlight-absent behavior).
 *
 * `creator` is set from the row's populated `creator` relation, run through
 * `serializeUserSecurely` — the same sanitization the ordinary comment list
 * applies (requirement 13.5, `apps/app/src/server/routes/comment.js:159-176`
 * is the precedent). `null` when the relation did not resolve to a user.
 */
function toIInlineCommentFromListRow(
  row: InlineCommentListRow,
): IInlineComment | null {
  if (
    row.creatorId == null ||
    row.quote == null ||
    row.prefix == null ||
    row.suffix == null ||
    row.approxOffset == null ||
    row.anchorOriginRevisionId == null
  ) {
    logger.warn(
      `Skipping malformed inline comment row '${row.id}': missing required anchor field(s)`,
    );
    return null;
  }

  return {
    id: row.id,
    pageId: row.pageId,
    creatorId: row.creatorId,
    creator:
      row.creator != null
        ? serializeUserSecurely(row.creator as IUserHasId)
        : null,
    comment: row.comment,
    anchorOriginRevisionId: row.anchorOriginRevisionId,
    anchor: {
      quote: row.quote,
      prefix: row.prefix,
      suffix: row.suffix,
      approxOffset: row.approxOffset,
    },
    resolvedById: row.resolvedById,
    resolvedAt: row.resolvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Maps a `listByPageId()` reply row (`InlineCommentListRow`) to
 * `InlineCommentReply` — the reply-side counterpart of
 * `toIInlineCommentFromListRow` above.
 *
 * Returns `null` (rather than throwing) for the same reason as
 * `toIInlineCommentFromListRow`: a malformed reply row must not fail the
 * whole page's comment list.
 *
 * `creator` is set from the row's populated `creator` relation, the same way
 * `toIInlineCommentFromListRow` populates the origin comment's `creator`.
 */
function toInlineCommentReplyFromListRow(
  row: InlineCommentListRow,
): InlineCommentReply | null {
  if (row.creatorId == null || row.replyToId == null) {
    logger.warn(
      `Skipping malformed inline comment reply row '${row.id}': missing required field(s)`,
    );
    return null;
  }

  return {
    id: row.id,
    pageId: row.pageId,
    creatorId: row.creatorId,
    creator:
      row.creator != null
        ? serializeUserSecurely(row.creator as IUserHasId)
        : null,
    comment: row.comment,
    replyToId: row.replyToId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Maps a `setResolved()` `update()` row to `IInlineComment` — the
 * update-result counterpart of `toIInlineComment`/`toIInlineCommentFromListRow`
 * above.
 */
function toIInlineCommentFromUpdateResult(
  row: InlineCommentUpdateResult,
): IInlineComment {
  // setResolved only ever updates an origin comment (validated by its own
  // findUnique check before this update runs), which always carries these
  // anchor fields together — same guarantee create()'s insert relies on.
  if (
    row.creatorId == null ||
    row.quote == null ||
    row.prefix == null ||
    row.suffix == null ||
    row.approxOffset == null ||
    row.anchorOriginRevisionId == null
  ) {
    throw new Error(
      `Inline comment row '${row.id}' is missing required anchor fields`,
    );
  }

  return {
    id: row.id,
    pageId: row.pageId,
    creatorId: row.creatorId,
    // setResolved()'s update() requests no `creator` include, same reason as
    // toIInlineComment() above.
    creator: null,
    comment: row.comment,
    anchorOriginRevisionId: row.anchorOriginRevisionId,
    anchor: {
      quote: row.quote,
      prefix: row.prefix,
      suffix: row.suffix,
      approxOffset: row.approxOffset,
    },
    resolvedById: row.resolvedById,
    resolvedAt: row.resolvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Maps an `updateReply()` `update()` row to `InlineCommentReply` — the
 * update-result counterpart of `toInlineCommentReply`/`toInlineCommentReplyFromListRow`
 * above, paired the same way `toIInlineCommentFromUpdateResult` pairs with
 * `toIInlineComment`.
 */
function toInlineCommentReplyFromUpdateResult(
  row: InlineCommentReplyUpdateResult,
): InlineCommentReply {
  // updateReply only ever updates a reply (validated by its own findUnique
  // check before this update runs), which always carries these fields
  // together — same guarantee createReply()'s insert relies on.
  if (row.creatorId == null || row.replyToId == null) {
    throw new Error(
      `Inline comment reply row '${row.id}' is missing required fields`,
    );
  }

  return {
    id: row.id,
    pageId: row.pageId,
    creatorId: row.creatorId,
    // updateReply()'s update() requests no `creator` include, same reason as
    // toInlineCommentReply() above.
    creator: null,
    comment: row.comment,
    replyToId: row.replyToId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// InlineCommentService
// ---------------------------------------------------------------------------

export class InlineCommentService {
  private readonly deps: InlineCommentServiceDeps;

  constructor(deps: InlineCommentServiceDeps) {
    this.deps = deps;
  }

  /**
   * Creates an origin (anchored) inline comment.
   *
   * - Rejects an empty `anchor.quote` (requirement 1.7 — the client already
   *   disables the create action on empty selection, but this is the
   *   server-side backstop design.md calls for).
   * - `anchor.quote`/`prefix`/`suffix` are persisted exactly as given — no
   *   normalization (requirement 1.4).
   * - `anchorOriginRevisionId` is set only here, from `input`, and this
   *   method never rewrites it afterward (requirement 5.4, 5.5 — there is
   *   no update path for it anywhere in this class).
   * - Records an `Activity` (`ACTION_INLINE_COMMENT_CREATE`) before calling
   *   `commentService.prepareMentionNotifications`, per design.md's
   *   Responsibilities & Constraints and the ordering `prepareMentionNotifications`
   *   requires (it takes `activityId` as an argument, so the activity must
   *   exist first). The activity id is minted here (rather than read off
   *   `createByParameters`'s return value) because the real extension's
   *   declared return type (`IActivity`) carries no `id` field, even though
   *   a row is created at runtime — see `IActivityParameters.id` doc in
   *   `~/server/models/activity.ts` for the caller-assigned-id contract this
   *   relies on.
   */
  async create(
    input: CreateInlineCommentInput,
    creatorId: string,
  ): Promise<IInlineComment> {
    if (input.anchor.quote === '') {
      throw new Error('anchor.quote must not be empty');
    }

    const created = await this.deps.prisma.comments.create({
      data: {
        pageId: input.pageId,
        creatorId,
        comment: input.comment,
        isInline: true,
        // Explicitly null (not omitted): omitting this field leaves it
        // entirely absent in the underlying MongoDB document, and Prisma's
        // MongoDB connector does not treat "field absent" as matching a
        // `where: { replyToId: null }` filter — which is exactly the filter
        // listByPageId() uses to select origin comments. An origin comment
        // is still, semantically, "not a reply" (replyToId: null); this
        // just makes that `null` a stored value instead of an absent field
        // so the read-side filter can see it. See list.integ.ts (real DB)
        // for the regression coverage that would have caught this.
        replyToId: null,
        quote: input.anchor.quote,
        prefix: input.anchor.prefix,
        suffix: input.anchor.suffix,
        approxOffset: input.anchor.approxOffset,
        anchorOriginRevisionId: input.anchorOriginRevisionId,
      },
      include: { page: true },
    });

    const activityId = new Types.ObjectId().toString();

    // Activity first — see the method doc and
    // .claude/rules/activity-recording.md. Unlike a route-level `addActivity`
    // middleware call, this service mints the activity itself: it runs
    // outside any HTTP request context, so `ip`/`endpoint` are omitted
    // (IActivityParameters marks both optional for exactly this case).
    await this.deps.prisma.activities.createByParameters({
      id: activityId,
      action: SupportedAction.ACTION_INLINE_COMMENT_CREATE,
      user: creatorId,
      target: input.pageId,
      targetModel: SupportedTargetModel.MODEL_PAGE,
      event: created.id,
      eventModel: SupportedEventModel.MODEL_COMMENT,
    });

    // Mention notification is best-effort: a failure here must not undo or
    // fail the comment creation that already succeeded (mirrors the legacy
    // `comments.add` route's `notifyMentions()` error handling in
    // `server/routes/comment.js`).
    try {
      const { notify } =
        await this.deps.commentService.prepareMentionNotifications(
          new Types.ObjectId(created.id),
          new Types.ObjectId(creatorId),
          new Types.ObjectId(activityId),
          toPageHasId(created.page),
        );
      await notify();
    } catch (err) {
      logger.error('Mention notification failed for inline comment', err);
    }

    return toIInlineComment(created);
  }

  /**
   * Creates a reply to an origin (anchored) inline comment.
   *
   * - Rejects `input.parentId` unless it references a row that is itself an
   *   origin inline comment (`isInline: true` and `replyToId: null`) — a
   *   regular non-inline comment, a reply's own id, or a nonexistent id are
   *   all rejected (design.md's Service Interface Preconditions, requirement
   *   1.8, 1.9).
   * - The inserted row leaves every anchor-related field unset (`quote`,
   *   `prefix`, `suffix`, `approxOffset`, `anchorOriginRevisionId`,
   *   `resolvedById`, `resolvedAt` all stay `null` — Prisma's `comments`
   *   model defaults them to `null` when omitted from `data`), matching
   *   design.md's Postconditions and requirement 1.9. No `page` relation is
   *   requested on this insert — the reply row itself never needs page data;
   *   only the *parent's* page (already fetched by the `findUnique` lookup
   *   above) is needed for `prepareMentionNotifications`.
   * - Records an `Activity` (`ACTION_INLINE_COMMENT_REPLY`) before calling
   *   `commentService.prepareMentionNotifications`, same ordering as
   *   `create()` and for the same reason (`prepareMentionNotifications`
   *   takes `activityId` as an argument, and the activity id is minted here
   *   for the same reason as in `create()` — see that method's doc).
   */
  async createReply(
    input: CreateInlineCommentReplyInput,
    creatorId: string,
  ): Promise<InlineCommentReply> {
    const parent = await this.deps.prisma.comments.findUnique({
      where: { id: input.parentId },
      include: { page: true },
    });

    if (parent == null || !parent.isInline || parent.replyToId != null) {
      throw new Error(
        `Inline comment '${input.parentId}' is not an origin inline comment`,
      );
    }

    const created = await this.deps.prisma.comments.create({
      data: {
        pageId: parent.pageId,
        creatorId,
        comment: input.comment,
        isInline: true,
        replyToId: input.parentId,
      },
    });

    const activityId = new Types.ObjectId().toString();

    // Activity first — see create()'s doc and .claude/rules/activity-recording.md.
    await this.deps.prisma.activities.createByParameters({
      id: activityId,
      action: SupportedAction.ACTION_INLINE_COMMENT_REPLY,
      user: creatorId,
      target: parent.pageId,
      targetModel: SupportedTargetModel.MODEL_PAGE,
      event: created.id,
      eventModel: SupportedEventModel.MODEL_COMMENT,
    });

    // Mention notification is best-effort — see create()'s doc for why
    // failures here must not undo or fail the reply that already succeeded.
    try {
      const { notify } =
        await this.deps.commentService.prepareMentionNotifications(
          new Types.ObjectId(created.id),
          new Types.ObjectId(creatorId),
          new Types.ObjectId(activityId),
          toPageHasId(parent.page),
        );
      await notify();
    } catch (err) {
      logger.error('Mention notification failed for inline comment reply', err);
    }

    return toInlineCommentReply(created);
  }

  /**
   * Lists every inline comment for a page, with each origin comment's
   * replies nested under it (design.md's Service Interface —
   * `listByPageId(pageId: string): Promise<InlineComment[]>; // 各要素が返信のネスト配列を含む`).
   *
   * - No existing `comments` extension method fetches "origin + replies"
   *   together (`removeWithReplies` is delete-only — see design.md's
   *   Responsibilities & Constraints and `.claude/skills` testing note in
   *   this file's header comment), so this assembles the nesting itself:
   *   one `findMany()` for origin comments (`isInline: true`,
   *   `replyToId: null`), then one `findMany()` for every reply to any of
   *   those origins (`replyToId: { in: [...] }`) in a single round trip
   *   rather than one query per origin.
   * - Both queries order by `createdAt: 'desc'`, matching the direction the
   *   existing `findCommentsByPageId`/`findCommentsByRevisionId` extension
   *   methods already use for the page-footer comment thread (see
   *   `apps/app/src/features/comment/server/models/comment.ts`). Display
   *   order (oldest-first reply threads, matching a normal comment's own
   *   thread) is a client-side concern, not this API's — see
   *   `InlineCommentReplies.tsx`, which reverses `replies` before
   *   rendering, the same way `PageComment.tsx` reverses its own `'desc'`
   *   fetch (`commentsFromOldest`) before grouping replies under their
   *   origin. This method stays a plain creation-order fetch either way.
   * - A reply is matched to its origin by `replyToId`; an origin with no
   *   matching rows gets an empty `replies` array (never `undefined`).
   */
  async listByPageId(pageId: string): Promise<InlineCommentWithReplies[]> {
    const originRows = await this.deps.prisma.comments.findMany({
      where: { pageId, isInline: true, replyToId: null },
      include: { creator: true },
      orderBy: { createdAt: 'desc' },
    });

    if (originRows.length === 0) {
      return [];
    }

    const replyRows = await this.deps.prisma.comments.findMany({
      where: {
        isInline: true,
        replyToId: { in: originRows.map((row) => row.id) },
      },
      include: { creator: true },
      orderBy: { createdAt: 'desc' },
    });

    const repliesByOriginId = replyRows.reduce((map, row) => {
      const reply = toInlineCommentReplyFromListRow(row);
      if (reply == null) {
        return map;
      }
      const existing = map.get(reply.replyToId) ?? [];
      map.set(reply.replyToId, [...existing, reply]);
      return map;
    }, new Map<string, InlineCommentReply[]>());

    // A malformed origin row (toIInlineCommentFromListRow returns null) is
    // skipped rather than failing the whole list — see that function's doc.
    return originRows
      .map((row) => {
        const comment = toIInlineCommentFromListRow(row);
        if (comment == null) {
          return null;
        }
        return { ...comment, replies: repliesByOriginId.get(row.id) ?? [] };
      })
      .filter((entry): entry is InlineCommentWithReplies => entry != null);
  }

  /**
   * Toggles an origin (anchored) inline comment's resolved state
   * (design.md's Service Interface —
   * `setResolved(id: string, resolved: boolean, actorId: string): Promise<InlineComment>`).
   *
   * - Rejects `id` unless it references a row that is itself an origin
   *   inline comment (`isInline: true` and `replyToId: null`) — a regular
   *   non-inline comment, a reply's own id, or a nonexistent id are all
   *   rejected (design.md's Postconditions: "setResolved の対象が返信
   *   （replyToId が非null）の場合はエラーとする", requirement 4.5). This
   *   mirrors `createReply()`'s parent-id precondition check above exactly
   *   (same three rejected shapes, same error-throwing convention: a generic
   *   `Error`, left for the route layer — task 3.5 — to map to an HTTP
   *   status).
   * - Authorization (does `actorId` hold comment permission on the page) is
   *   deliberately NOT re-checked here: design.md's Responsibilities
   *   explicitly scope that check to the route layer
   *   ("解決トグルの認可は...作成者に限定しない"), and this method takes
   *   `actorId` only as "who performed this action" for the Activity record.
   * - `resolved: true` sets `resolvedById`/`resolvedAt` (to `actorId` and
   *   now); `resolved: false` resets both to `null` (design.md's
   *   Postconditions).
   * - Records an `Activity` — `ACTION_INLINE_COMMENT_RESOLVE` when
   *   `resolved: true`, `ACTION_INLINE_COMMENT_UNRESOLVE` when
   *   `resolved: false` — using the same self-minted-`activityId` mechanism
   *   as `create()`/`createReply()` (see `create()`'s doc). Unlike those two
   *   methods, this one does NOT call `prepareMentionNotifications`: design.md's
   *   Requirements Traceability table maps requirements 4.1-4.4 to
   *   InlineCommentService/InlineCommentList only, with no notification
   *   integration listed — mention notification is scoped to comment
   *   creation (requirement 3.x), not the resolve toggle.
   */
  async setResolved(
    id: string,
    resolved: boolean,
    actorId: string,
  ): Promise<IInlineComment> {
    const target = await this.deps.prisma.comments.findUnique({
      where: { id },
    });

    if (target == null || !target.isInline || target.replyToId != null) {
      throw new Error(`Inline comment '${id}' is not an origin inline comment`);
    }

    const updated = await this.deps.prisma.comments.update({
      where: { id },
      data: resolved
        ? { resolvedById: actorId, resolvedAt: new Date() }
        : { resolvedById: null, resolvedAt: null },
    });

    const activityId = new Types.ObjectId().toString();

    // Activity emission mirrors create()/createReply() — see that method's
    // doc and .claude/rules/activity-recording.md. No
    // prepareMentionNotifications call here — see this method's doc.
    await this.deps.prisma.activities.createByParameters({
      id: activityId,
      action: resolved
        ? SupportedAction.ACTION_INLINE_COMMENT_RESOLVE
        : SupportedAction.ACTION_INLINE_COMMENT_UNRESOLVE,
      user: actorId,
      target: updated.pageId,
      targetModel: SupportedTargetModel.MODEL_PAGE,
      event: updated.id,
      eventModel: SupportedEventModel.MODEL_COMMENT,
    });

    return toIInlineCommentFromUpdateResult(updated);
  }

  /**
   * Updates the body of an origin (anchored) inline comment
   * (design.md's Service Interface —
   * `updateComment(id: string, comment: string, actorId: string): Promise<IInlineComment>`).
   *
   * - Rejects `id` unless it references a row that is itself an origin
   *   inline comment (`isInline: true` and `replyToId: null`) — the same
   *   three rejected shapes as `setResolved()`'s precondition check
   *   (design.md's Postconditions, requirement 1.5's counterpart for
   *   "wrong kind of id").
   * - Additionally rejects when `actorId` does not match the row's
   *   `creatorId` — the service-layer half of defense-in-depth authorization
   *   (design.md: the route layer, task 3.5, re-checks the same thing; both
   *   must agree, and a mismatch would be a bug, not a race).
   * - Only `comment` is written; `anchor`/`anchorOriginRevisionId`/
   *   `resolvedAt`/`resolvedById` are never touched by this method
   *   (design.md's Invariants).
   * - Records an `Activity` (`ACTION_INLINE_COMMENT_UPDATE`), using the same
   *   self-minted-`activityId` mechanism as the other methods in this class
   *   (see `create()`'s doc). No `prepareMentionNotifications` call — editing
   *   an existing comment's body is not a new mention-notification event
   *   (design.md's Requirements Traceability lists no notification
   *   integration for requirement 1.x, mirroring `setResolved()`).
   */
  async updateComment(
    id: string,
    comment: string,
    actorId: string,
  ): Promise<IInlineComment> {
    const target = await this.deps.prisma.comments.findUnique({
      where: { id },
    });

    if (
      target == null ||
      !target.isInline ||
      target.replyToId != null ||
      target.creatorId !== actorId
    ) {
      throw new Error(
        `Inline comment '${id}' is not an origin inline comment owned by '${actorId}'`,
      );
    }

    const updated = await this.deps.prisma.comments.update({
      where: { id },
      data: { comment },
    });

    const activityId = new Types.ObjectId().toString();

    await this.deps.prisma.activities.createByParameters({
      id: activityId,
      action: SupportedAction.ACTION_INLINE_COMMENT_UPDATE,
      user: actorId,
      target: updated.pageId,
      targetModel: SupportedTargetModel.MODEL_PAGE,
      event: updated.id,
      eventModel: SupportedEventModel.MODEL_COMMENT,
    });

    return toIInlineCommentFromUpdateResult(updated);
  }

  /**
   * Updates the body of a reply to an origin inline comment
   * (design.md's Service Interface —
   * `updateReply(id: string, comment: string, actorId: string): Promise<InlineCommentReply>`).
   *
   * Mirrors `updateComment()` exactly, except the precondition requires
   * `replyToId != null` (this row IS a reply, not an origin comment), and
   * this method emits `ACTION_INLINE_COMMENT_REPLY_UPDATE` instead — see
   * `updateComment()`'s doc for the shared reasoning (creatorId
   * defense-in-depth check, no touched anchor/resolved fields, no mention
   * notification).
   */
  async updateReply(
    id: string,
    comment: string,
    actorId: string,
  ): Promise<InlineCommentReply> {
    const target = await this.deps.prisma.comments.findUnique({
      where: { id },
    });

    if (
      target == null ||
      !target.isInline ||
      target.replyToId == null ||
      target.creatorId !== actorId
    ) {
      throw new Error(
        `Inline comment reply '${id}' is not a reply owned by '${actorId}'`,
      );
    }

    const updated = await this.deps.prisma.comments.update({
      where: { id },
      data: { comment },
    });

    const activityId = new Types.ObjectId().toString();

    await this.deps.prisma.activities.createByParameters({
      id: activityId,
      action: SupportedAction.ACTION_INLINE_COMMENT_REPLY_UPDATE,
      user: actorId,
      target: updated.pageId,
      targetModel: SupportedTargetModel.MODEL_PAGE,
      event: updated.id,
      eventModel: SupportedEventModel.MODEL_COMMENT,
    });

    return toInlineCommentReplyFromUpdateResult(updated);
  }

  /**
   * Deletes an origin (anchored) inline comment together with its replies
   * (design.md's Service Interface —
   * `deleteComment(id: string, actorId: string): Promise<void>`).
   *
   * - Same precondition check as `updateComment()` (origin-comment shape +
   *   `creatorId === actorId`) — see that method's doc.
   * - Uses `prisma.comments.removeWithReplies(id)` (existing extension
   *   method, `apps/app/src/features/comment/server/models/comment.ts`) so
   *   the origin and every reply to it are removed together in one
   *   transaction (design.md's Postconditions, requirement 2.4). This is
   *   also this feature's `Allowed Dependencies` entry for that method — see
   *   design.md's Boundary Commitments.
   * - Records an `Activity` (`ACTION_INLINE_COMMENT_DELETE`) — same
   *   self-minted-`activityId` mechanism as the other methods here. No
   *   `prepareMentionNotifications` call (deleting is not a mention event).
   */
  async deleteComment(id: string, actorId: string): Promise<void> {
    const target = await this.deps.prisma.comments.findUnique({
      where: { id },
    });

    if (
      target == null ||
      !target.isInline ||
      target.replyToId != null ||
      target.creatorId !== actorId
    ) {
      throw new Error(
        `Inline comment '${id}' is not an origin inline comment owned by '${actorId}'`,
      );
    }

    await this.deps.prisma.comments.removeWithReplies(id);

    const activityId = new Types.ObjectId().toString();

    await this.deps.prisma.activities.createByParameters({
      id: activityId,
      action: SupportedAction.ACTION_INLINE_COMMENT_DELETE,
      user: actorId,
      target: target.pageId,
      targetModel: SupportedTargetModel.MODEL_PAGE,
      event: target.id,
      eventModel: SupportedEventModel.MODEL_COMMENT,
    });
  }

  /**
   * Deletes a single reply to an origin inline comment
   * (design.md's Service Interface —
   * `deleteReply(id: string, actorId: string): Promise<void>`).
   *
   * - Same precondition check as `updateReply()` (reply shape + `creatorId
   *   === actorId`) — see that method's doc.
   * - Uses a plain `prisma.comments.delete({ where: { id } })` — unlike
   *   `deleteComment()`, no cascade is needed here: a reply has no rows that
   *   depend on it (design.md's Responsibilities: "単純な
   *   `prisma.comments.delete({ where: { id } })`（道連れ削除は不要）").
   * - Records an `Activity` (`ACTION_INLINE_COMMENT_REPLY_DELETE`) — same
   *   mechanism as the other methods here.
   */
  async deleteReply(id: string, actorId: string): Promise<void> {
    const target = await this.deps.prisma.comments.findUnique({
      where: { id },
    });

    if (
      target == null ||
      !target.isInline ||
      target.replyToId == null ||
      target.creatorId !== actorId
    ) {
      throw new Error(
        `Inline comment reply '${id}' is not a reply owned by '${actorId}'`,
      );
    }

    await this.deps.prisma.comments.delete({ where: { id } });

    const activityId = new Types.ObjectId().toString();

    await this.deps.prisma.activities.createByParameters({
      id: activityId,
      action: SupportedAction.ACTION_INLINE_COMMENT_REPLY_DELETE,
      user: actorId,
      target: target.pageId,
      targetModel: SupportedTargetModel.MODEL_PAGE,
      event: target.id,
      eventModel: SupportedEventModel.MODEL_COMMENT,
    });
  }
}
