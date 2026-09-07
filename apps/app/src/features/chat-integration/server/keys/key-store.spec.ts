import { generateKeyPairSync } from 'node:crypto';
import type { MongoMemoryServer } from 'mongodb-memory-server-core';

import {
  connectSelfContainedMongo,
  disconnectSelfContainedMongo,
} from '^/test/setup/mongo/self-contained-connection';

import type { ChatKeyEncryptionEnv } from './key-encryption';
import { encryptChatKeyForStorage } from './key-encryption';
import {
  resolvePeerKey,
  signWithOwnKey,
  storeOwnKey,
  storePeerKey,
} from './key-store';
import { ChatIntegrationKey } from './models/chat-integration-key';

// A clearly-fake 32-byte value; tests only need AES-256 to accept it.
// `storeOwnKey`/`signWithOwnKey` read via `encryptChatKeyForStorage`'s
// default `process.env` parameter, so the encryption key must actually be
// exported into `process.env` for the duration of these tests (unlike
// `key-encryption.spec.ts`, which passes a `ChatKeyEncryptionEnv` explicitly
// to every call and never touches `process.env`).
const TEST_ENCRYPTION_KEY: ChatKeyEncryptionEnv = {
  CHAT_INTEGRATION_KEY_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
};

describe('key-store', () => {
  let mongod: MongoMemoryServer | undefined;
  const previousEnv = { ...process.env };

  beforeAll(async () => {
    ({ mongod } = await connectSelfContainedMongo('growi_test_unit_key_store'));
  });

  beforeEach(async () => {
    await ChatIntegrationKey.deleteMany({});
    Object.assign(process.env, TEST_ENCRYPTION_KEY);
  });

  afterEach(() => {
    process.env = { ...previousEnv };
  });

  afterAll(async () => {
    await disconnectSelfContainedMongo(mongod);
  });

  const past = new Date(Date.now() - 60_000);
  const future = new Date(Date.now() + 60_000);

  describe('resolvePeerKey', () => {
    it('returns the peer key for (relationId, keyId), and NOT the own key stored under the same keyId', async () => {
      const relationId = 'relation-1';
      const keyId = 'shared-key-id';
      const ownKeyPair = generateKeyPairSync('ed25519');
      const peerKeyPair = generateKeyPairSync('ed25519');

      // Own and peer rows deliberately share the SAME keyId under the same
      // relation -- this is the exact configuration design.md warns about:
      // "自分の鍵を引くと、自分が署名した要求を自分の口へ差し戻す形が通る".
      await storeOwnKey({ relationId, keyId }, ownKeyPair.privateKey, past);
      await storePeerKey(
        { relationId, keyId },
        peerKeyPair.publicKey.export({ format: 'jwk' }),
        past,
      );

      const resolved = await resolvePeerKey({ relationId, keyId });

      expect(resolved).not.toBeNull();
      // Proves the PEER's key came back: compare the raw key bytes against
      // the peer's public key, not the own key's.
      expect(resolved?.export({ type: 'spki', format: 'pem' })).toBe(
        peerKeyPair.publicKey.export({ type: 'spki', format: 'pem' }),
      );
      expect(resolved?.export({ type: 'spki', format: 'pem' })).not.toBe(
        ownKeyPair.publicKey.export({ type: 'spki', format: 'pem' }),
      );
    });

    it('does not return a revoked peer key', async () => {
      const relationId = 'relation-revoked';
      const keyId = 'peer-key-1';
      const { publicKey } = generateKeyPairSync('ed25519');

      await ChatIntegrationKey.create({
        relationId,
        side: 'peer',
        keyId,
        key: JSON.stringify(publicKey.export({ format: 'jwk' })),
        validFrom: past,
        revokedAt: past,
      });

      const resolved = await resolvePeerKey({ relationId, keyId });
      expect(resolved).toBeNull();
    });

    it('does not return a not-yet-valid peer key', async () => {
      const relationId = 'relation-future';
      const keyId = 'peer-key-1';
      const { publicKey } = generateKeyPairSync('ed25519');

      await storePeerKey(
        { relationId, keyId },
        publicKey.export({ format: 'jwk' }),
        future,
      );

      const resolved = await resolvePeerKey({ relationId, keyId });
      expect(resolved).toBeNull();
    });

    it('returns a valid peer key (validFrom in the past, not revoked)', async () => {
      const relationId = 'relation-valid';
      const keyId = 'peer-key-1';
      const { publicKey } = generateKeyPairSync('ed25519');

      await storePeerKey(
        { relationId, keyId },
        publicKey.export({ format: 'jwk' }),
        past,
      );

      const resolved = await resolvePeerKey({ relationId, keyId });
      expect(resolved).not.toBeNull();
      expect(resolved?.export({ type: 'spki', format: 'pem' })).toBe(
        publicKey.export({ type: 'spki', format: 'pem' }),
      );
    });

    it('does not resolve a key registered under a different relationId, even with the same keyId', async () => {
      const keyId = 'peer-key-1';
      const { publicKey } = generateKeyPairSync('ed25519');
      await storePeerKey(
        { relationId: 'relation-a', keyId },
        publicKey.export({ format: 'jwk' }),
        past,
      );

      const resolved = await resolvePeerKey({
        relationId: 'relation-b',
        keyId,
      });
      expect(resolved).toBeNull();
    });
  });

  describe('signWithOwnKey', () => {
    it('exposes a signing capability, never the decrypted key material', async () => {
      const relationId = 'relation-sign';
      const keyId = 'own-key-1';
      const { privateKey } = generateKeyPairSync('ed25519');
      await storeOwnKey({ relationId, keyId }, privateKey, past);

      const body = new TextEncoder().encode('{"hello":"world"}');
      const result = await signWithOwnKey({
        relationId,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        expiresInSec: 60,
      });

      // The result's shape is a signature envelope (headers/nonce/expiresAt)
      // -- a fixed structural shape derived FROM signing, not the plaintext
      // private key itself. A regression that returned the plaintext PEM
      // instead (e.g. `return pem` in place of `return sign({...})`) would
      // fail every one of these assertions: no `headers.signature`, no
      // `nonce`, and the value would contain the PEM banner text below.
      expect(result.headers.signature).toEqual(expect.any(String));
      expect(result.headers['signature-input']).toEqual(expect.any(String));
      expect(result.headers['content-digest']).toEqual(expect.any(String));
      expect(result.nonce).toEqual(expect.any(String));
      expect(result.expiresAt).toBeInstanceOf(Date);

      const plaintextPem = privateKey
        .export({ type: 'pkcs8', format: 'pem' })
        .toString();
      expect(result.headers.signature).not.toContain('PRIVATE KEY');
      expect(JSON.stringify(result)).not.toContain(plaintextPem);
    });

    it("signs with the relation's own key -- the signature verifies against that key's public half via @growi/chat's own verify()", async () => {
      const relationId = 'relation-verify';
      const keyId = 'own-key-2';
      const { publicKey, privateKey } = generateKeyPairSync('ed25519');
      await storeOwnKey({ relationId, keyId }, privateKey, past);

      const headers = { 'content-type': 'application/json' };
      const body = new TextEncoder().encode('{"a":1}');
      const result = await signWithOwnKey({
        relationId,
        method: 'POST',
        headers,
        body,
        expiresInSec: 60,
      });

      // keyid on the wire is `${relationId}:${keyId}` (packages/chat's
      // encodeKeyId) -- proves signWithOwnKey attached the right key
      // identity, not just any usable key.
      expect(result.headers['signature-input']).toContain(
        `keyid="${relationId}:${keyId}"`,
      );

      // Round-trips the produced signature through @growi/chat's own verify()
      // against the public half of the SAME key pair that was stored -- this
      // is the end-to-end proof that signWithOwnKey used the right private
      // key, not just that it produced *some* signature-shaped output.
      const { verify } = await import('@growi/chat/server');
      const verifyResult = await verify({
        method: 'POST',
        headers: { ...headers, ...result.headers },
        body,
        resolvePublicKey: async () => publicKey,
        consumeNonce: async () => true,
      });
      expect(verifyResult.ok).toBe(true);
    });

    it('throws when the relation has no currently-usable own key', async () => {
      await expect(
        signWithOwnKey({
          relationId: 'relation-missing',
          method: 'POST',
          headers: {},
          body: new Uint8Array(),
          expiresInSec: 60,
        }),
      ).rejects.toThrow();
    });

    it('does not use a revoked own key to sign', async () => {
      const relationId = 'relation-own-revoked';
      const keyId = 'own-key-3';
      const { privateKey } = generateKeyPairSync('ed25519');
      await ChatIntegrationKey.create({
        relationId,
        side: 'own',
        keyId,
        key: encryptChatKeyForStorage(
          privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
        ),
        validFrom: past,
        revokedAt: past,
      });

      await expect(
        signWithOwnKey({
          relationId,
          method: 'POST',
          headers: {},
          body: new Uint8Array(),
          expiresInSec: 60,
        }),
      ).rejects.toThrow();
    });
  });
});
