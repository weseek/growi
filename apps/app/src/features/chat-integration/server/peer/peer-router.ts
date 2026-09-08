// Wires the 6 entry points the chat-integration proxy calls onto GROWI's
// existing apiv3 routing (design.md's op table under "口の一覧", task 3.5:
// "proxy から届く 6 つの口を既存の経路に登録する").
//
// This router's own job stops at wiring: attach `signatureGuard(op)`
// (task 3.2) in front of each of the 5 signed ops, and `pairingEndpoint`
// (task 3.4) in front of the one unsigned op. Two of the five signed
// handlers are still placeholders -- their business logic belongs to a
// later task (`key-register-to-growi`/`key-revoke-to-growi`: 7.2) -- see
// each handler's own comment for why its particular placeholder shape was
// chosen. `command` (task 5.1), `settings-pull` (task 3.5's own text:
// "押し込みが届かなかったときに proxy が取りに来る保険。版と設定を返す"),
// and `account-link-start` (task 6.1) all have real behavior. `command`
// needs a `Crowi` instance (search, ACL, app title), so `createPeerRouter`
// now takes one and threads it through -- every other handler here still
// ignores it.
//
// **No handler here re-parses `req.body`.** `signatureGuard` already ran
// this op's own contract-check function over the verified bytes and
// attached the typed result to `req.chatPeer.body` -- reading `req.body`
// again (or calling `JSON.parse` on it again) would either read the raw
// `Buffer` past the point it is trusted for shape, or duplicate a parse
// that already happened (tasks.md Implementation Notes, task 3.5 note).

import {
  type AccountLinkStartResponse,
  type KeyOperationResult,
  OP_ENDPOINTS,
  OP_NAMES,
  type RelationSettings,
  type SettingsPullResponse,
} from '@growi/chat';
import type { IUser } from '@growi/core';
import type { RequestHandler, Router } from 'express';
import express from 'express';
import mongoose from 'mongoose';

import type Crowi from '~/server/crowi';

import {
  buildAccountLinkUrl,
  findOrCreatePendingAccountLinkOrder,
} from '../account-link/create-link-order';
import { ChatAccountLink } from '../account-link/models/chat-account-link';
import { createCommandEndpoint } from '../command/command-endpoint';
import { ChatRelation } from '../models/chat-relation';
import { pairingEndpoint } from '../pairing/pairing-endpoint';
import { ChatChannelPermission } from '../settings/models/chat-channel-permission';
import {
  type InboundPeerOp,
  signatureGuard,
  type VerifiedPeerRequest,
} from '../signature-guard';

/**
 * Every `OP_ENDPOINTS` path template for an op this GROWI serves is of the
 * form `{growiUri}/_api/v3/chat-integration/peer/...`. Deriving each route's
 * path from that table (rather than writing the suffix a second time by
 * hand) is what keeps this router's mount points from drifting away from
 * `OP_ENDPOINTS` -- the single source of truth `signature-guard.ts` already
 * builds its own op vocabulary from (design constraint: reuse `OP_ENDPOINTS`,
 * don't hand-write paths that could disagree with it).
 */
const GROWI_FEATURE_BASE_TEMPLATE = '{growiUri}/_api/v3/chat-integration';

const routerPathFor = (op: InboundPeerOp): string => {
  const { pathTemplate } = OP_ENDPOINTS[op];
  if (!pathTemplate.startsWith(GROWI_FEATURE_BASE_TEMPLATE)) {
    // A wiring mistake, not a runtime condition -- fail while routes are
    // being registered (mirrors `signatureGuard`'s own throw for the same
    // class of mistake), rather than silently mounting the wrong path.
    throw new Error(
      `peer-router: OP_ENDPOINTS['${op}'].pathTemplate ('${pathTemplate}') does not start with '${GROWI_FEATURE_BASE_TEMPLATE}'`,
    );
  }
  return pathTemplate.slice(GROWI_FEATURE_BASE_TEMPLATE.length);
};

/**
 * The one entry point with no row in `OP_ENDPOINTS` -- by design, the table
 * deliberately omits both unsigned entry points (op-names.ts's own comment:
 * "The two unsigned entry points ... are deliberately absent. Both run
 * before any key exists, so they carry no `relationId`, no `op`, and no
 * signature."). design.md's op table (line 618) names this exact path.
 */
const PAIRING_CHALLENGE_PATH = '/peer/pairing/challenge';

/**
 * `command` -- real behavior for all 5 command kinds as of task 5.2 (search,
 * link-preview, help from task 5.1; create-page/keep from task 5.2).
 *
 * `requestArrivedAt` is captured as the very first statement, before even
 * reading `chatPeer.body` -- design.md's audit-logging section is explicit
 * that a write command's Activity row must carry the request's actual
 * arrival time, not whenever `handle` happens to reach the write branch deep
 * inside `computeResponse`. `req.ip` / `req.originalUrl` are threaded
 * through the same way: `command-endpoint.ts` has no `req` of its own to
 * read them from (`resolveActor` only resolves the operator partway through
 * `handle`, unlike a normal apiv3 route where `addActivity` middleware reads
 * `req.user` at arrival).
 */
const commandHandler = (crowi: Crowi): RequestHandler => {
  const commandEndpoint = createCommandEndpoint(crowi);
  return async (req, res) => {
    const requestArrivedAt = new Date();
    const { chatPeer } = req as VerifiedPeerRequest<typeof OP_NAMES.command>;
    const body = await commandEndpoint.handle(chatPeer.body, {
      ip: req.ip,
      endpoint: req.originalUrl,
      requestArrivedAt,
    });
    res.status(200).json(body);
  };
};

/**
 * Placeholder for `key-register-to-growi` / `key-revoke-to-growi` (real
 * behavior: task 7.2). `{ status: 'ok' }` is the minimal valid
 * `KeyOperationResult` shape -- it proves the request reached a real
 * handler past `signatureGuard`, without claiming a specific rejection
 * reason that would not yet be backed by any actual key-store check.
 */
const keyOperationPlaceholderHandler: RequestHandler = (_req, res) => {
  const body: KeyOperationResult = { status: 'ok' };
  res.status(200).json(body);
};

/**
 * `account-link-start` -- real behavior as of task 6.1. Reuses task 5.1's
 * `findOrCreatePendingAccountLinkOrder`/`buildAccountLinkUrl`
 * (`../account-link/create-link-order.ts`) rather than re-deriving the
 * "reuse a still-pending order, don't multiply one-time links on retry"
 * logic here (tasks.md Implementation Notes, task 5.1's entry: "task 6.1
 * はこのファイルを再利用すること。同じロジックを書き直さない").
 *
 * The one piece of behavior this handler adds on top of that helper: if the
 * chat account is ALREADY linked to a GROWI user for this relation, answer
 * `already-linked` with that user's username instead of issuing a
 * (pointless) new order -- `AccountLinkStartResponse`'s own vocabulary
 * requires this distinction, and `findOrCreatePendingAccountLinkOrder` has
 * no reason to know about `chat_account_links` at all (it only owns orders).
 */
const accountLinkStartHandler: RequestHandler = async (req, res) => {
  const { chatPeer } = req as VerifiedPeerRequest<
    typeof OP_NAMES.accountLinkStart
  >;
  const { relationId, actor } = chatPeer.body;

  const existingLink = await ChatAccountLink.findOne({
    relationId,
    platform: actor.platform,
    accountId: actor.accountId,
  });
  if (existingLink != null) {
    const User = mongoose.model<IUser>('User');
    const user = await User.findById(existingLink.userId);
    const body: AccountLinkStartResponse = {
      status: 'already-linked',
      growiUserName: user?.username ?? '',
    };
    res.status(200).json(body);
    return;
  }

  const order = await findOrCreatePendingAccountLinkOrder(relationId, actor);
  const body: AccountLinkStartResponse = {
    status: 'link-issued',
    linkUrl: buildAccountLinkUrl(order.token),
    expiresAt: order.expiredAt.toISOString(),
  };
  res.status(200).json(body);
};

/**
 * `settings-pull` -- the one signed endpoint this task gives real behavior
 * (task 3.5's own text: "設定の取り出しは、押し込みが届かなかったときに
 * proxy が取りに来る保険である。版と設定を返す"). Reads
 * `chat_relations.settingsVersion` and `chat_channel_permissions` for the
 * relation the signature proved this request is about, and returns them
 * verbatim as a `SettingsPullResponse` -- no 'all'/'none' encoding decision
 * is made here; each stored row's `allowedChannels` (a plain `string[]`)
 * already satisfies `RelationSettings.channelPermissions[].allowedChannels`
 * (`ReadonlyArray<string> | 'all' | 'none'`) without translation.
 */
const settingsPullHandler: RequestHandler = async (req, res) => {
  const { chatPeer } = req as VerifiedPeerRequest<typeof OP_NAMES.settingsPull>;
  const { relationId } = chatPeer.body;

  const relation = await ChatRelation.findOne({ relationId }).lean();
  if (relation == null) {
    // Unreachable in practice -- `signatureGuard`'s `resolvePeerKey` only
    // resolves a key for a relation that exists, and `acceptEnvelope`
    // already confirmed this body's `relationId` matches the verified key's
    // relation. Still answered safely rather than crashing into a 500.
    res.status(404).end();
    return;
  }

  const permissionRows = await ChatChannelPermission.find({
    relationId,
  }).lean();

  const channelPermissions: RelationSettings['channelPermissions'] =
    permissionRows.map((row) => ({
      commandName: row.commandName,
      allowedChannels: row.allowedChannels,
    }));

  const body: SettingsPullResponse = {
    settings: { relationId, channelPermissions },
    version: relation.settingsVersion,
  };
  res.status(200).json(body);
};

/**
 * The 6 endpoints, wired in production (no dependency overrides -- both
 * `signatureGuard` and `pairingEndpoint` already default to their real,
 * DB-backed dependencies).
 */
export const createPeerRouter = (crowi: Crowi): Router => {
  const router = express.Router();

  router.post(
    routerPathFor(OP_NAMES.command),
    signatureGuard(OP_NAMES.command),
    commandHandler(crowi),
  );
  router.post(
    routerPathFor(OP_NAMES.keyRegisterToGrowi),
    signatureGuard(OP_NAMES.keyRegisterToGrowi),
    keyOperationPlaceholderHandler,
  );
  router.post(
    routerPathFor(OP_NAMES.keyRevokeToGrowi),
    signatureGuard(OP_NAMES.keyRevokeToGrowi),
    keyOperationPlaceholderHandler,
  );
  router.post(
    routerPathFor(OP_NAMES.settingsPull),
    signatureGuard(OP_NAMES.settingsPull),
    settingsPullHandler,
  );
  router.post(
    routerPathFor(OP_NAMES.accountLinkStart),
    signatureGuard(OP_NAMES.accountLinkStart),
    accountLinkStartHandler,
  );
  // No signatureGuard: the one op design.md marks "署名: 不要" (op-names.ts's
  // own comment on why this path has no OP_ENDPOINTS row either).
  router.post(PAIRING_CHALLENGE_PATH, pairingEndpoint);

  return router;
};
