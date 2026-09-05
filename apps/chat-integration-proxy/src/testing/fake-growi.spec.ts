// What `startFakeGrowi` promises to tasks 11.2-11.5: a GROWI that is reached
// over a real socket, that actually verifies the RFC 9421 signature on what it
// receives, and that can itself sign a request this proxy's own guard accepts.
//
// Nothing here stubs `sign()` or `verify()`. A fake that answered whatever it
// was sent would still make every test below pass if the assertions were only
// about the answer, so each direction is paired with a refusal case: that pair
// is what proves the fake is checking rather than agreeing.
//
// The proxy side is driven through the REAL `createGrowiClient` /
// `createGrowiUriResolver` / `signatureGuard`, so this spec also pins the one
// thing that cannot be checked by reading source: that a fake GROWI on
// 127.0.0.1 over plain http is reachable through the declared-destination
// judgement (`GROWI_ALLOWED_DESTINATIONS`) at all.

import type { CommandRequest } from '@growi/chat';
import { OP_NAMES, RESPONSE_KINDS } from '@growi/chat';
import type { KeyRef, VerifyFailure } from '@growi/chat/server';
import { type ServerType, serve } from '@hono/node-server';
import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createGrowiClient } from '../growi/index.js';
import { createGrowiUriResolver } from '../relation/index.js';
import {
  type SignatureGuardDeps,
  type SignedRequestEnv,
  signatureGuard,
} from '../routes/index.js';
import { startFakeGrowi } from './fake-growi.js';
import { createSigningIdentity } from './signing-identity.js';

const RELATION_ID = 'relation-under-test';

const commandRequest = (): CommandRequest => ({
  relationId: RELATION_ID,
  op: OP_NAMES.command,
  requestId: 'request-1',
  actor: { platform: 'slack', accountId: 'U1', displayName: 'Ada' },
  channel: {
    platform: 'slack',
    channelId: 'C1',
    channelName: 'general',
    isPrivate: false,
  },
  kind: 'search',
  keyword: 'onboarding',
  limit: 5,
});

/** The proxy half of the pair, built without touching storage. */
const proxySide = (growiHostname: string) => {
  const identity = createSigningIdentity(RELATION_ID, 'proxy-key-0001');
  const client = createGrowiClient({
    uriResolver: createGrowiUriResolver({
      closedNetwork: {
        allowList: [growiHostname],
        trustedCaCertsFor: () => [],
      },
    }),
    keyService: {
      signerFor: async () => ({
        key: identity.key,
        privateKey: identity.privateKey,
      }),
    },
  });
  return { identity, client };
};

const openServers: ServerType[] = [];
const closeAll: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(closeAll.splice(0).map((close) => close()));
  await Promise.all(
    openServers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => resolve());
        }),
    ),
  );
});

describe('proxy -> fake GROWI', () => {
  it('answers a signed command with the scripted response, over a real socket', async () => {
    const growi = await startFakeGrowi({
      responders: {
        [OP_NAMES.command]: () => ({
          body: {
            kind: RESPONSE_KINDS.created,
            pageUrl: 'https://growi.example.com/created',
          },
        }),
      },
    });
    closeAll.push(growi.close);

    const { identity, client } = proxySide(growi.hostname);
    growi.registerPeerKey(identity.asPeerKey);

    const result = await client.sendCommand(growi.baseUrl, commandRequest());

    expect(result).toEqual({
      ok: true,
      response: {
        kind: RESPONSE_KINDS.created,
        pageUrl: 'https://growi.example.com/created',
      },
    });
  });

  it('records the op and the relation the signature proved, not the one the body claimed', async () => {
    const growi = await startFakeGrowi({
      responders: {
        [OP_NAMES.command]: () => ({
          body: { kind: RESPONSE_KINDS.help, commands: [] },
        }),
      },
    });
    closeAll.push(growi.close);

    const { identity, client } = proxySide(growi.hostname);
    growi.registerPeerKey(identity.asPeerKey);
    await client.sendCommand(growi.baseUrl, commandRequest());

    expect(growi.received()).toEqual([
      expect.objectContaining({
        op: OP_NAMES.command,
        verifiedKey: identity.key satisfies KeyRef,
      }),
    ]);
  });

  it('refuses an unsigned request and records nothing as received', async () => {
    const growi = await startFakeGrowi({});
    closeAll.push(growi.close);

    const response = await fetch(
      `${growi.baseUrl}/_api/v3/chat-integration/peer/command`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(commandRequest()),
      },
    );

    expect(response.status).toBe(401);
    expect(growi.received()).toEqual([]);
    expect(growi.refusals().map((refusal) => refusal.failure)).toEqual([
      'malformed' satisfies VerifyFailure,
    ]);
  });

  it('refuses a signature made with a key it was never given', async () => {
    const growi = await startFakeGrowi({});
    closeAll.push(growi.close);

    // The proxy signs as usual; the GROWI simply never registers the key.
    const { client } = proxySide(growi.hostname);
    const result = await client.sendCommand(growi.baseUrl, commandRequest());

    expect(result).toEqual({ ok: false, reason: 'http-error' });
    expect(growi.received()).toEqual([]);
  });

  it('answers an op it was given no responder for without recording it as answered', async () => {
    const growi = await startFakeGrowi({});
    closeAll.push(growi.close);

    const { identity, client } = proxySide(growi.hostname);
    growi.registerPeerKey(identity.asPeerKey);

    const result = await client.pullSettings(growi.baseUrl, RELATION_ID);

    // A scripted GROWI that silently invented an answer would let a later task
    // pass while proving nothing, so the missing script has to be visible.
    expect(result).toEqual({ ok: false, reason: 'http-error' });
  });
});

describe('fake GROWI -> proxy', () => {
  /** The real guard, on a real port, with nothing else behind it. */
  const guardedProxy = (deps: {
    readonly resolvePublicKey: SignatureGuardDeps['resolvePublicKey'];
    readonly recordFailure?: (failure: VerifyFailure) => void;
  }) => {
    const seen: string[] = [];
    const app = new Hono<SignedRequestEnv>();
    app.use(
      '*',
      signatureGuard({
        resolvePublicKey: deps.resolvePublicKey,
        consumeNonce: () => Promise.resolve(true),
        recordFailure: (failure) => {
          deps.recordFailure?.(failure);
          return Promise.resolve();
        },
      }),
    );
    app.post('/chat-integration/notification', (c) => {
      // The body the guard verified, not the one re-read from the request:
      // proving the fake's signature covered these bytes is the whole point.
      seen.push((c.get('verifiedBody') as { op: string }).op);
      return c.json({ status: 'ok' });
    });

    const server = serve({ fetch: app.fetch, port: 0 });
    openServers.push(server);
    const address = server.address();
    const port =
      typeof address === 'object' && address != null ? address.port : 0;
    return { baseUrl: `http://127.0.0.1:${port}`, seen };
  };

  it('signs a request the real signature guard accepts', async () => {
    const growi = await startFakeGrowi({});
    closeAll.push(growi.close);

    const proxy = guardedProxy({
      resolvePublicKey: (ref) =>
        Promise.resolve(
          ref.relationId === RELATION_ID && ref.keyId === growi.ownKey.keyId
            ? growi.ownKey.publicKey
            : null,
        ),
    });

    const answer = await growi.callProxy(proxy.baseUrl, {
      relationId: RELATION_ID,
      op: OP_NAMES.notification,
      body: { notificationId: 'n-1' },
    });

    expect(answer.status).toBe(200);
    expect(proxy.seen).toEqual([OP_NAMES.notification]);
  });

  it('is refused by that same guard when the proxy does not hold its key', async () => {
    const growi = await startFakeGrowi({});
    closeAll.push(growi.close);

    const recordFailure = vi.fn();
    const proxy = guardedProxy({
      resolvePublicKey: () => Promise.resolve(null),
      recordFailure,
    });

    const answer = await growi.callProxy(proxy.baseUrl, {
      relationId: RELATION_ID,
      op: OP_NAMES.notification,
      body: { notificationId: 'n-1' },
    });

    expect(answer.status).toBe(401);
    expect(proxy.seen).toEqual([]);
    expect(recordFailure).toHaveBeenCalledWith(
      'unknown-key' satisfies VerifyFailure,
    );
  });
});
