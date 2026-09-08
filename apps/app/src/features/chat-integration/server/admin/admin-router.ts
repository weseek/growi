// Task 9.1's admin screen backend: the receiving end for the 3 things the
// admin screen has to show (design.md "管理画面と個人設定" -- Requirements
// 1.3, 1.4, 12.5) plus the write operations it exposes: Requirement 9.1's
// pairing submission (`submitPairingRequest`, task 7.3) and task 9.2's
// channel-permission settings save (`saveRelationSettings`, Requirements
// 11.1/11.2/11.4).
//
// Every endpoint here requires a real, logged-in GROWI ADMIN
// (`loginRequiredFactory` + `adminRequiredFactory`) -- same convention as
// `oauth-install-router.ts`'s `POST /state`. Ordinary logged-in-browser JSON
// requests, mounted under this feature's own apiv3 prefix
// (`server/index.ts`), outside `/peer/`.
//
// What this endpoint does NOT do, deliberately, per this task's own
// completion condition ("画面が出て、使える機能と連携の状態が読めることが試験で
// 示される" -- read-only for capabilities/status):
//   - It does not invent per-platform capability logic. `GET
//     /relations/:relationId/capabilities` relays `CapabilityReport` from
//     `fetchCapabilities` (task 7.1) VERBATIM -- no field is dropped,
//     renamed, or branched on by platform. The task's own text warns against
//     this ("独自に「このサービスはスラッシュコマンドが使える」等を決め打ちしない
//     こと").
//   - It does not build the "connect a new workspace via OAuth" flow. That
//     flow is not wired end to end yet (tasks.md's Implementation Notes on
//     task 9.0: the proxy-side authorization-URL endpoint and the
//     proxy→GROWI callback verification are both out of this spec's
//     boundary). The pairing operation this screen exposes is the
//     REGISTRATION-CODE mechanism instead (task 7.3's
//     `submitPairingRequest`), which needs no OAuth round trip at all --
//     `issueOAuthInstallState`/`verifyOAuthInstallState` (task 9.0) remain
//     unused by this router until that cross-repo wiring exists.

import type { IUserHasId } from '@growi/core/dist/interfaces';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler, Router } from 'express';
import express from 'express';
import { Types } from 'mongoose';

import type Crowi from '~/server/crowi';
import adminRequiredFactory from '~/server/middlewares/admin-required';
import loginRequiredFactory from '~/server/middlewares/login-required';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';

import { describeChatKeyEncryptionConfiguration } from '../keys';
import { submitPairingRequest } from '../pairing/pairing-service';
import { fetchCapabilities, fetchConnectionStatus } from '../proxy-client';
import { readRelationSettings } from '../settings/relation-settings-store';
import { listRelationsForAdmin } from './admin-service';
import { saveRelationSettings } from './save-relation-settings';

interface AuthenticatedAdminRequest extends Request {
  readonly user: IUserHasId;
}

/** `GET /encryption-status` -- whether pairing may proceed at all (task 1.3). */
const encryptionStatusHandler = (_req: Request, res: ApiV3Response): void => {
  res.apiv3(describeChatKeyEncryptionConfiguration());
};

/** `GET /relations` -- every relation this GROWI has paired with, active or not. */
const listRelationsHandler = async (
  _req: Request,
  res: ApiV3Response,
): Promise<void> => {
  const relations = await listRelationsForAdmin();
  res.apiv3({ relations });
};

/**
 * `GET /relations/:relationId/capabilities` -- relays `CapabilityReport`
 * (Requirement 1.3) exactly as the proxy answered it. `502` on any
 * `ProxyCallFailure` -- the admin screen distinguishes "the proxy said no
 * capabilities" (which cannot happen; the report always has a body) from
 * "the call itself failed", not different sub-reasons of the latter, since
 * every reason means the same thing to an operator here: "try again / check
 * the proxy".
 */
const capabilitiesHandler = async (
  req: Request,
  res: ApiV3Response,
): Promise<void> => {
  const { relationId } = req.params;
  const result = await fetchCapabilities(relationId);
  if (!result.ok) {
    res.apiv3Err(
      new ErrorV3(
        `Could not fetch capabilities from the proxy: ${result.reason}`,
        result.reason,
      ),
      502,
    );
    return;
  }
  res.apiv3(result.response);
};

/**
 * `GET /relations/:relationId/connection-status` -- relays
 * `ConnectionStatusView` (Requirement 1.4) exactly as the proxy answered it.
 */
const connectionStatusHandler = async (
  req: Request,
  res: ApiV3Response,
): Promise<void> => {
  const { relationId } = req.params;
  const result = await fetchConnectionStatus(relationId);
  if (!result.ok) {
    res.apiv3Err(
      new ErrorV3(
        `Could not fetch connection status from the proxy: ${result.reason}`,
        result.reason,
      ),
      502,
    );
    return;
  }
  res.apiv3(result.response);
};

/**
 * `GET /relations/:relationId/settings` -- this relation's channel
 * permissions and its current settings version, read through the very same
 * function `settings-pull` answers the proxy with
 * (`readRelationSettings`), so the screen an administrator edits shows what
 * the proxy is actually being told.
 */
const getSettingsHandler = async (
  req: Request,
  res: ApiV3Response,
): Promise<void> => {
  const { relationId } = req.params;
  const settings = await readRelationSettings(relationId);
  if (settings == null) {
    res.apiv3Err(
      new ErrorV3(
        `Relation '${relationId}' is not found`,
        'relation-not-found',
      ),
      404,
    );
    return;
  }
  res.apiv3(settings);
};

/**
 * `POST /relations/:relationId/settings` -- saves the relation's channel
 * permissions (task 9.2, Requirements 11.1/11.2/11.4).
 *
 * The whole set is sent and stored wholesale, matching what goes over the
 * wire to the proxy; there is no per-command endpoint.
 *
 * A push failure is NOT an error here: `saveRelationSettings` still answers
 * `saved`, and this handler relays that as `200` with `push: { ok: false,
 * reason }` so the screen can say "saved, but the proxy has not been told
 * yet -- it will fetch it". Answering an error status would tell the
 * administrator nothing was saved, which is false (see
 * `save-relation-settings.ts`).
 */
const saveSettingsHandler = async (
  req: Request,
  res: ApiV3Response,
): Promise<void> => {
  const { relationId } = req.params;
  const { channelPermissions } = req.body as {
    readonly channelPermissions?: unknown;
  };

  const outcome = await saveRelationSettings(relationId, channelPermissions);

  if (outcome.status === 'invalid-settings') {
    res.apiv3Err(new ErrorV3(outcome.detail, 'invalid-settings'), 400);
    return;
  }
  if (outcome.status === 'relation-not-found') {
    res.apiv3Err(
      new ErrorV3(
        `Relation '${relationId}' is not found`,
        'relation-not-found',
      ),
      404,
    );
    return;
  }
  res.apiv3(outcome);
};

interface PairingRequestBody {
  readonly registrationCode?: unknown;
  readonly proxyUri?: unknown;
  readonly growiUri?: unknown;
  readonly growiLabel?: unknown;
}

const asNonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

/**
 * `POST /pairing` -- submits a registration code (task 7.3). This is the
 * ONLY pairing operation this screen exposes -- see this file's header on
 * why the OAuth "Add to Slack"-style flow is not built here.
 *
 * `submitPairingRequest` itself refuses when the encryption key is
 * unconfigured (returning `{ status: 'key-encryption-unconfigured' }`), so
 * this handler does not duplicate that check -- a second copy here would be
 * a second place that could drift from the single source of truth in
 * `pairing-service.ts`. `400` for a malformed request body; every outcome
 * `submitPairingRequest` can produce is relayed as `200` with its own
 * `status` field, since each is a distinct, expected result the admin
 * screen renders differently (not an HTTP-level error).
 */
const submitPairingHandler = async (
  req: AuthenticatedAdminRequest,
  res: ApiV3Response,
): Promise<void> => {
  const body = req.body as PairingRequestBody;
  const registrationCode = asNonEmptyString(body.registrationCode);
  const proxyUri = asNonEmptyString(body.proxyUri);
  const growiUri = asNonEmptyString(body.growiUri);
  const growiLabel = asNonEmptyString(body.growiLabel);

  if (
    registrationCode == null ||
    proxyUri == null ||
    growiUri == null ||
    growiLabel == null
  ) {
    res.apiv3Err(
      new ErrorV3(
        "'registrationCode', 'proxyUri', 'growiUri', and 'growiLabel' are all required",
        'invalid-pairing-request',
      ),
      400,
    );
    return;
  }

  const outcome = await submitPairingRequest({
    registrationCode,
    proxyUri,
    growiUri,
    growiLabel,
    createdBy: new Types.ObjectId(req.user._id),
  });
  res.apiv3(outcome);
};

export const createAdminRouter = (crowi: Crowi): Router => {
  const router = express.Router();
  const loginRequiredStrictly = loginRequiredFactory(crowi);
  const adminRequired = adminRequiredFactory(crowi);

  router.use(loginRequiredStrictly, adminRequired);

  router.get(
    '/encryption-status',
    encryptionStatusHandler as unknown as RequestHandler,
  );
  router.get('/relations', listRelationsHandler as unknown as RequestHandler);
  router.get(
    '/relations/:relationId/capabilities',
    capabilitiesHandler as unknown as RequestHandler,
  );
  router.get(
    '/relations/:relationId/connection-status',
    connectionStatusHandler as unknown as RequestHandler,
  );
  router.get(
    '/relations/:relationId/settings',
    getSettingsHandler as unknown as RequestHandler,
  );
  router.post(
    '/relations/:relationId/settings',
    saveSettingsHandler as unknown as RequestHandler,
  );
  router.post('/pairing', submitPairingHandler as unknown as RequestHandler);

  return router;
};
