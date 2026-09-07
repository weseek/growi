// GROWI-side key storage (design.md `KeyStore` -- Requirement 9.5, 10.6).
//
// `@growi/chat` (`packages/chat/src/signature/verify.ts`) defines no named
// "KeyStore" interface -- it only declares the SHAPE of the function it
// needs handed to it: `VerifyParams.resolvePublicKey: (ref: KeyRef) =>
// Promise<KeyObject | null>`. That function's own doc comment states the two
// invariants this module exists to satisfy: it must return the PEER's key
// only (never this GROWI's own), and it must return `null` for a revoked key
// or one that is not active yet. `resolvePeerKey` below is built to match
// that signature exactly, so it can be passed straight into `verify()`.
//
// `sign()` (`packages/chat/src/signature/sign.ts`) takes a `privateKey:
// KeyObject` parameter directly -- there is no signing-callback abstraction
// in `@growi/chat` either. Per design.md ("復号する場所 -- 署名する関数の中だけ。
// 他の層へは復号した値ではなく署名する関数を渡す"), the decrypted key must not
// escape this module: `signWithOwnKey` below is the only function that reads
// the plaintext, and it hands the caller a finished `SignResult` (headers,
// nonce, expiry), never the key material itself.
//
// Both `key`-material formats are this module's own decision (nothing
// upstream fixes them): a peer's Ed25519 public key travels as a
// `PublicKeyRegistration.publicKeyJwk` (`@growi/chat`'s wire type) and is
// stored as that JWK's JSON serialization; this GROWI's own private key is
// stored as a PKCS8 PEM string, encrypted at rest by `encryptChatKeyForStorage`
// (`./key-encryption`) exactly as `chat_integration_keys`'s schema validator
// requires for `side: 'own'`.

import {
  createPrivateKey,
  createPublicKey,
  type JsonWebKey,
  type KeyObject,
} from 'node:crypto';
import {
  DEFAULT_EXPIRES_IN_SEC,
  type KeyRef,
  type SignParams,
  type SignResult,
  sign,
} from '@growi/chat/server';

import {
  encryptChatKeyForStorage,
  withDecryptedChatKey,
} from './key-encryption';
import { ChatIntegrationKey } from './models/chat-integration-key';

/**
 * Resolves the PEER's signing key for a relation -- matches
 * `VerifyParams.resolvePublicKey` exactly, so it can be passed straight into
 * `@growi/chat`'s `verify()`.
 *
 * Only ever queries `side: 'peer'` -- this is what guarantees that looking up
 * a key with this GROWI's own `keyId` can never return this GROWI's own key
 * (design.md: "自分の鍵を引くと、自分が署名した要求を自分の口へ差し戻す形が通る").
 *
 * Returns `null` -- never throws for "not found" -- for every reference this
 * function cannot serve: an unknown `(relationId, keyId)` pair, a revoked
 * key, or one whose `validFrom` is still in the future (Requirement 10.6).
 */
export const resolvePeerKey = async (
  ref: KeyRef,
  now: Date = new Date(),
): Promise<KeyObject | null> => {
  const row = await ChatIntegrationKey.findOne({
    relationId: ref.relationId,
    side: 'peer',
    keyId: ref.keyId,
    validFrom: { $lte: now },
    revokedAt: null,
  }).lean();
  if (row == null) {
    return null;
  }

  try {
    return createPublicKey({
      key: JSON.parse(row.key) as JsonWebKey,
      format: 'jwk',
    });
  } catch {
    // A row that does not decode as the JWK this module writes cannot be
    // used to verify anything -- reported the same way as "no such key" so
    // callers don't need a second failure mode to handle.
    return null;
  }
};

/**
 * Stores a peer's public key under a relation. Uses `.create()` (a
 * document-path write) so `chat_integration_keys`'s schema validator runs --
 * see Implementation Notes in tasks.md for why `updateOne`-style writes
 * would silently bypass it for `side: 'own'` rows; the same write path is
 * used here for consistency even though the `side: 'peer'` validator is a
 * no-op.
 */
export const storePeerKey = async (
  ref: KeyRef,
  publicKeyJwk: JsonWebKey,
  validFrom: Date = new Date(),
): Promise<void> => {
  await ChatIntegrationKey.create({
    relationId: ref.relationId,
    side: 'peer',
    keyId: ref.keyId,
    key: JSON.stringify(publicKeyJwk),
    validFrom,
    revokedAt: null,
  });
};

/**
 * Stores this GROWI's own private key under a relation, encrypted at rest.
 *
 * MUST use `.create()`, never `updateOne`/`findOneAndUpdate`: the schema's
 * own-side validator only runs on a document-path write (Mongoose binds
 * `this` to the Query on an `updateOne`-style call, so `side` is unreadable
 * there and the check silently passes anything through -- see tasks.md
 * Implementation Notes).
 */
export const storeOwnKey = async (
  ref: KeyRef,
  privateKey: KeyObject,
  validFrom: Date = new Date(),
): Promise<void> => {
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  await ChatIntegrationKey.create({
    relationId: ref.relationId,
    side: 'own',
    keyId: ref.keyId,
    key: encryptChatKeyForStorage(pem),
    validFrom,
    revokedAt: null,
  });
};

/** What the caller of {@link signWithOwnKey} supplies -- everything `sign()` needs except the key material, which this module alone resolves and decrypts. */
export type SignWithOwnKeyParams = Omit<SignParams, 'key' | 'privateKey'> & {
  readonly relationId: string;
  readonly expiresInSec?: number;
};

/**
 * Signs a request as this GROWI, for the given relation.
 *
 * This is the "means to sign", not the key itself (design.md): the decrypted
 * private key exists only inside `withDecryptedChatKey`'s callback, for the
 * duration of the single `sign()` call, and this function returns only the
 * resulting `SignResult` -- headers, nonce, expiry. No caller of this
 * function can obtain the plaintext key through it.
 *
 * @throws if this relation has no currently-usable own-side key (none
 * registered, or all revoked / not yet active).
 */
export const signWithOwnKey = async (
  params: SignWithOwnKeyParams,
  now: Date = new Date(),
): Promise<SignResult> => {
  const { relationId, expiresInSec, ...rest } = params;

  const row = await ChatIntegrationKey.findOne({
    relationId,
    side: 'own',
    validFrom: { $lte: now },
    revokedAt: null,
  }).lean();
  if (row == null) {
    throw new Error(
      `signWithOwnKey: relation ${relationId} has no currently-usable own-side signing key`,
    );
  }

  const key: KeyRef = { relationId, keyId: row.keyId };

  return withDecryptedChatKey(row.key, (pem) => {
    const privateKey = createPrivateKey(pem);
    return sign({
      ...rest,
      expiresInSec: expiresInSec ?? DEFAULT_EXPIRES_IN_SEC,
      key,
      privateKey,
    });
  });
};
