// Handling the 3 read-only commands the proxy sends over the `command` op
// (design.md `CommandEndpoint` -- task 5.1: search, link-preview, help).
// Page-writing commands (`create-page`, `keep`) are task 5.2's job; see the
// comment on `handleWriteCommand` below for why they still route through
// this same file rather than being rejected earlier.
//
// Three invariants design.md states for `CommandEndpoint.handle`, all
// enforced here, in this order, before any command-specific work runs:
//
//   1. **Never throw.** Every path below returns a `CommandResponse`; the
//      one `try`/`catch` at the very top of `handle` is the backstop for a
//      genuinely unexpected failure (a bug, a DB outage), not a substitute
//      for handling the known cases below explicitly.
//   2. **Channel permission is judged first**, with `@growi/chat`'s `judge`,
//      before anything else -- including before resolving who the actor is.
//      A command this channel may not run gets refused without ever
//      touching `chat_account_links` or the search index (Requirement 11.3).
//   3. **A processed `(relationId, requestId)` replays its stored response
//      verbatim**, rather than recomputing (Requirement 10.4). This
//      includes a channel-permission refusal or a read-denial answer, not
//      only a "successful" one -- design.md draws no such exception, and
//      the proxy has no way to tell "this failed" from "this hasn't been
//      tried yet" apart from getting the same answer back both times.
//
// A response that reaches `chat_processed_requests` is deliberately never
// one produced by the top-level catch: an unexpected failure (a transient DB
// hiccup, a bug) is exactly the kind of outcome the proxy's retry SHOULD get
// a fresh attempt at, not the one answer entombed for 24 hours (task 1.2's
// TTL). Only a resolved, deliberate `CommandResponse` -- computed inside
// `computeResponse` -- is persisted.

import {
  type ChatAccountRef,
  COMMAND_NAMES,
  type CommandRequest,
  type CommandResponse,
  judge,
  type PermissionVerdict,
  RESPONSE_KINDS,
  type RelationSettings,
} from '@growi/chat';
import type { PageGrant } from '@growi/core';
import mongoose from 'mongoose';

import type Crowi from '~/server/crowi';
import type { PageDocument } from '~/server/models/page';
import { growiInfoService } from '~/server/service/growi-info';
import loggerFactory from '~/utils/logger';

import {
  buildAccountLinkUrl,
  findOrCreatePendingAccountLinkOrder,
} from '../account-link/create-link-order';
import {
  buildHelpContent,
  buildLinkPreview,
  filterPagesForViewer,
  mapToSearchResultItems,
  overFetchCount,
  type ViewerFilterActor,
} from '../content';
import { ChatProcessedRequest } from '../models/chat-processed-request';
import { ChatChannelPermission } from '../settings/models/chat-channel-permission';
import {
  type ResolvedActor,
  resolveActor,
  resolveReadDenial,
} from './resolve-actor';

const logger = loggerFactory(
  'growi:features:chat-integration:command-endpoint',
);

export interface CommandEndpoint {
  handle(request: CommandRequest): Promise<CommandResponse>;
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { readonly code?: unknown }).code === 11000;

type CommandErrorCode = Extract<
  CommandResponse,
  { kind: typeof RESPONSE_KINDS.error }
>['code'];

const errorResponse = (
  code: CommandErrorCode,
  message: string,
): CommandResponse => ({ kind: RESPONSE_KINDS.error, code, message });

const permissionDeniedResponse = (
  verdict: Extract<PermissionVerdict, { allowed: false }>,
): CommandResponse =>
  errorResponse(
    verdict.reason,
    verdict.reason === 'no-settings'
      ? 'This command has no channel permission configured for this connection yet.'
      : 'This command is not allowed in this channel.',
  );

/** design.md's "冒頭で `judge` を通す" (Requirement 11.3). */
const checkChannelPermission = async (
  request: CommandRequest,
): Promise<PermissionVerdict> => {
  const rows = await ChatChannelPermission.find({
    relationId: request.relationId,
  }).lean();

  const settings: RelationSettings = {
    relationId: request.relationId,
    channelPermissions: rows.map((row) => ({
      commandName: row.commandName,
      allowedChannels: row.allowedChannels,
    })),
  };

  return judge(settings, request.kind, request.channel);
};

/**
 * design.md's read-denial guidance (Requirement 7.6): an inactive user is
 * already linked, so "go link your account" would change nothing for them;
 * only a genuinely unlinked chat account gets the account-link response.
 */
const buildReadDenialResponse = async (
  denial: 'not-linked' | 'inactive',
  relationId: string,
  actor: ChatAccountRef,
  crowi: Crowi,
): Promise<CommandResponse> => {
  if (denial === 'inactive') {
    return errorResponse(
      'forbidden',
      'Your GROWI user is currently unavailable. Contact your GROWI administrator.',
    );
  }

  const order = await findOrCreatePendingAccountLinkOrder(relationId, actor);
  return {
    kind: RESPONSE_KINDS.accountLinkRequired,
    growiLabel: crowi.appService.getAppTitle(),
    linkUrl: buildAccountLinkUrl(order.token),
  };
};

/** Candidate shape carried from the raw search hit through the viewer filter to the mapper. */
interface SearchCandidate {
  readonly pageId: string;
  readonly path: string;
  readonly updatedAt: Date;
  readonly commentCount: number;
}

const handleSearch = async (
  request: Extract<CommandRequest, { kind: typeof COMMAND_NAMES.search }>,
  resolved: ResolvedActor,
  crowi: Crowi,
): Promise<CommandResponse> => {
  if (!crowi.searchService.isReachable) {
    return errorResponse('invalid', 'Search is not available right now.');
  }

  // Gen 1's flaw (design.md's Testing Strategy item 2, task 3.3's own
  // hand-off note): `searchKeyword` reads an unresolved searcher as
  // `userGroups: null`, not `[]`. Passing `[]` here would silently change
  // "anonymous" into "a user with no groups", which is a different
  // permission shape to the search delegator.
  const userGroupsForSearch =
    resolved.user != null ? [...resolved.userGroups] : null;

  const [searchResult, delegatorName] = await crowi.searchService.searchKeyword(
    request.keyword,
    null,
    resolved.user,
    userGroupsForSearch,
    { limit: overFetchCount(request.limit), offset: 0 },
  );

  const formatted = await crowi.searchService.formatSearchResult(
    searchResult,
    delegatorName,
    resolved.user,
    userGroupsForSearch,
  );

  const candidates: SearchCandidate[] = formatted.data.map(({ data }) => ({
    pageId: data._id.toString(),
    path: data.path,
    updatedAt: data.updatedAt,
    commentCount: data.commentCount,
  }));

  const viewerActor: ViewerFilterActor = {
    user: resolved.user,
    userGroups: resolved.userGroups,
  };
  const filtered = await filterPagesForViewer(
    candidates,
    viewerActor,
    request.limit,
  );

  const items = mapToSearchResultItems(
    filtered.map((page) => ({
      rank: page.rank,
      path: page.path,
      updatedAt: page.updatedAt,
      commentCount: page.commentCount,
    })),
    growiInfoService.getSiteUrl(),
  );

  return {
    kind: RESPONSE_KINDS.search,
    items,
    appliedAs: resolved.user != null ? 'linked-user' : 'anonymous',
  };
};

/** A 24-hex Mongo ObjectId, matched the same way Gen 1's link-shared handler tells a permalink from a path. */
const PAGE_ID_PATTERN = /^[0-9a-f]{24}$/;

interface ResolvedLinkPreviewPage {
  readonly path: string;
  readonly grant: PageGrant | null | undefined;
  readonly body: string;
  readonly updatedAt: Date;
  readonly commentCount: number;
}

const resolvePageFromUrl = async (
  pageUrl: string,
): Promise<ResolvedLinkPreviewPage | null> => {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(pageUrl).pathname);
  } catch (_error) {
    return null;
  }

  const maybeId = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const query = PAGE_ID_PATTERN.test(maybeId)
    ? { _id: maybeId }
    : { path: pathname };

  const Page = mongoose.model<PageDocument>('Page');
  const page = await Page.findOne(query).populate('revision').lean();
  if (page == null) {
    return null;
  }

  const revision = page.revision as { body?: string } | null | undefined;

  return {
    path: page.path,
    grant: page.grant,
    body: revision?.body ?? '',
    updatedAt: page.updatedAt,
    commentCount: page.commentCount,
  };
};

const handleLinkPreview = async (
  request: Extract<CommandRequest, { kind: typeof COMMAND_NAMES.linkPreview }>,
  crowi: Crowi,
): Promise<CommandResponse> => {
  const page = await resolvePageFromUrl(request.pageUrl);
  if (page == null) {
    return errorResponse(
      'invalid',
      'This URL does not match any page on this GROWI.',
    );
  }

  const preview = buildLinkPreview(
    page,
    crowi.aclService.isGuestAllowedToRead(),
  );
  return { kind: RESPONSE_KINDS.linkPreview, ...preview };
};

/**
 * `create-page` / `keep` are task 5.2's responsibility (permission
 * checking, path-conflict detection, and audit recording all belong there).
 * This still returns a well-formed `CommandResponse` rather than throwing or
 * being unreachable, because `CommandRequest` is one type this endpoint
 * accepts as a whole -- a write request reaching a build that only has 5.1
 * implemented is a real, expected state (a proxy running ahead of this
 * GROWI's deployed version), not a programming error.
 */
const handleWriteCommand = (): CommandResponse =>
  errorResponse('invalid', 'This command is not available on this GROWI yet.');

const computeResponse = async (
  request: CommandRequest,
  crowi: Crowi,
): Promise<CommandResponse> => {
  const verdict = await checkChannelPermission(request);
  if (!verdict.allowed) {
    return permissionDeniedResponse(verdict);
  }

  if (request.kind === COMMAND_NAMES.help) {
    return { kind: RESPONSE_KINDS.help, commands: buildHelpContent() };
  }

  if (
    request.kind === COMMAND_NAMES.createPage ||
    request.kind === COMMAND_NAMES.keep
  ) {
    return handleWriteCommand();
  }

  const resolved = await resolveActor(request.relationId, request.actor);
  const denial = resolveReadDenial(
    resolved,
    crowi.aclService.isGuestAllowedToRead(),
  );
  if (denial != null) {
    return buildReadDenialResponse(
      denial,
      request.relationId,
      request.actor,
      crowi,
    );
  }

  if (request.kind === COMMAND_NAMES.search) {
    return handleSearch(request, resolved, crowi);
  }
  return handleLinkPreview(request, crowi);
};

/**
 * Runs `computeResponse`, replaying a previously-stored response verbatim
 * for a repeated `(relationId, requestId)` instead of recomputing
 * (Requirement 10.4). The unique index on `chat_processed_requests` --
 * not a read-then-write -- is what makes this safe against two identical
 * requests in flight at once: both call `create`, at most one succeeds, and
 * the other reads back what the winner just stored.
 */
const handleWithIdempotency = async (
  request: CommandRequest,
  crowi: Crowi,
): Promise<CommandResponse> => {
  const { relationId, requestId } = request;

  const alreadyProcessed = await ChatProcessedRequest.findOne({
    relationId,
    requestId,
  }).lean();
  if (alreadyProcessed != null) {
    return alreadyProcessed.response as CommandResponse;
  }

  const response = await computeResponse(request, crowi);

  try {
    await ChatProcessedRequest.create({ relationId, requestId, response });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const winner = await ChatProcessedRequest.findOne({
        relationId,
        requestId,
      }).lean();
      if (winner != null) {
        return winner.response as CommandResponse;
      }
    }
    throw error;
  }

  return response;
};

/** Builds the `CommandEndpoint` this GROWI serves `command` requests with. */
export const createCommandEndpoint = (crowi: Crowi): CommandEndpoint => ({
  handle: async (request: CommandRequest): Promise<CommandResponse> => {
    try {
      return await handleWithIdempotency(request, crowi);
    } catch (error) {
      logger.error('Unexpected failure while handling a chat command', error);
      return errorResponse(
        'invalid',
        'Failed to process this command due to an unexpected error.',
      );
    }
  },
});
