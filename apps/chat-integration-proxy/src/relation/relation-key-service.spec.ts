// What these tests pin down is the pair of properties task 5.2 exists for:
//
//  1. a key is MINTED and STORED in the same act as the pairing that needs it,
//     through the very `DbClient` handle the caller supplied -- which is what
//     lets `PairingService` (task 5.4) build this service over the `tx` of its
//     own `$transaction` and get the `relation` row and the `own_key` row
//     committed or rolled back together;
//  2. what leaves this layer is the MEANS to sign (a `KeyObject`), never a
//     decrypted PEM (design.md 9.6 / 「復号は `own-key-repository` の中だけ」).
//
// The cipher below is a plain reversible fake rather than real authenticated
// encryption. That is honest here and not a weakened test: encrypting at rest
// is `own-key-repository`'s contract, and `own-key-repository.spec.ts` already
// proves it against a real AES-256-GCM cipher. This service never sees a
// ciphertext; it only has to hand the repository the PEM.
import { createPublicKey } from 'node:crypto';
import {
  isValidKeyIdShape,
  isValidPublicKeyMaterial,
  type SignParams,
} from '@growi/chat/server';
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import type { PrismaClient } from '../db/index.js';
import type { SecretCipher } from '../types/index.js';
import { createRelationKeyService } from './relation-key-service.js';

const PREFIX = 'plain:';
const fakeCipher: SecretCipher = {
  encrypt: (plaintext) => `${PREFIX}${plaintext}`,
  decrypt: (ciphertext) => ciphertext.slice(PREFIX.length),
};

const NOW = new Date('2026-06-01T00:00:00.000Z');

const ownKeyRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'own-key-row-1',
  relationId: 'relation-1',
  keyId: 'proxy-key-1',
  privateKeyPem: '',
  validFrom: new Date('2026-01-01T00:00:00.000Z'),
  revokedAt: null,
  supersededKeyId: null,
  deliveredToPeerAt: null,
  ...overrides,
});

// `listKeys` selects a subset of columns, but the mocked delegate is typed
// against the whole row -- so a listing fixture is just a row.
const rowForListing = ownKeyRow;

const serviceOver = (prisma: PrismaClient, keyId = 'proxy-key-1') =>
  createRelationKeyService({
    db: prisma,
    cipher: fakeCipher,
    generateKeyId: () => keyId,
    now: () => NOW,
  });

describe('relationKeyService.issue (Requirement 9.5)', () => {
  it('writes the key through the very handle it was given, so a caller can scope it to its own transaction', async () => {
    // The same-transaction property design.md requires is structural: this
    // service never reaches for a client of its own, it writes through the
    // `DbClient` it was constructed with. A second service built over another
    // handle must therefore leave the first handle untouched.
    const tx = mockDeep<PrismaClient>();
    const other = mockDeep<PrismaClient>();
    tx.ownKey.create.mockResolvedValue(ownKeyRow());
    other.ownKey.create.mockResolvedValue(ownKeyRow());

    await serviceOver(tx).issue('relation-1');
    await serviceOver(other, 'other-key').issue('relation-2');

    expect(tx.ownKey.create).toHaveBeenCalledTimes(1);
    expect(other.ownKey.create).toHaveBeenCalledTimes(1);
    expect(tx.ownKey.create.mock.calls[0][0].data).toMatchObject({
      relationId: 'relation-1',
      keyId: 'proxy-key-1',
      validFrom: NOW,
      supersededKeyId: null,
    });
  });

  it('mints a fresh Ed25519 private key and stores it, never returning it', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.ownKey.create.mockResolvedValue(ownKeyRow());

    const result = await serviceOver(prisma).issue('relation-1');

    const storedPem = fakeCipher.decrypt(
      prisma.ownKey.create.mock.calls[0][0].data.privateKeyPem as string,
    );
    expect(storedPem).toContain('BEGIN PRIVATE KEY');
    expect(createPublicKey(storedPem).asymmetricKeyType).toBe('ed25519');

    expect(Object.keys(result).sort()).toEqual(['keyId', 'publicKeyJwk']);
    expect(JSON.stringify(result)).not.toContain('PRIVATE KEY');
    expect(JSON.stringify(result)).not.toContain(storedPem);
  });

  it('returns the public half of the key it stored, in the form the peer accepts', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.ownKey.create.mockResolvedValue(ownKeyRow());

    const { publicKeyJwk } = await serviceOver(prisma).issue('relation-1');

    // The peer's own registration gate, not a restatement of this code.
    expect(isValidPublicKeyMaterial({ ...publicKeyJwk })).toEqual({ ok: true });

    const storedPem = fakeCipher.decrypt(
      prisma.ownKey.create.mock.calls[0][0].data.privateKeyPem as string,
    );
    expect(publicKeyJwk).toEqual(
      createPublicKey(storedPem).export({ format: 'jwk' }),
    );
  });

  it('gives every relation its own key, so one leak does not spread', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.ownKey.create.mockResolvedValue(ownKeyRow());
    const service = createRelationKeyService({
      db: prisma,
      cipher: fakeCipher,
      now: () => NOW,
    });

    const first = await service.issue('relation-1');
    const second = await service.issue('relation-2');

    expect(first.publicKeyJwk).not.toEqual(second.publicKeyJwk);
    expect(first.keyId).not.toBe(second.keyId);
    const [callA, callB] = prisma.ownKey.create.mock.calls;
    expect(callA[0].data.privateKeyPem).not.toBe(callB[0].data.privateKeyPem);
  });

  it('mints a keyId the peer will accept at registration', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.ownKey.create.mockResolvedValue(ownKeyRow());
    const service = createRelationKeyService({
      db: prisma,
      cipher: fakeCipher,
      now: () => NOW,
    });

    const { keyId } = await service.issue('relation-1');

    expect(isValidKeyIdShape(keyId)).toBe(true);
  });
});

describe('relationKeyService.signerFor (Requirement 9.6)', () => {
  const withStoredKey = async (prisma: DeepMockProxy<PrismaClient>) => {
    prisma.ownKey.create.mockResolvedValue(ownKeyRow());
    await serviceOver(prisma).issue('relation-1');
    const storedCiphertext = prisma.ownKey.create.mock.calls[0][0].data
      .privateKeyPem as string;
    prisma.ownKey.findUnique.mockResolvedValue(
      ownKeyRow({ privateKeyPem: storedCiphertext }),
    );
    return storedCiphertext;
  };

  it('hands back the means to sign, not the key material', async () => {
    const prisma = mockDeep<PrismaClient>();
    const storedCiphertext = await withStoredKey(prisma);
    prisma.ownKey.findMany.mockResolvedValue([rowForListing()]);

    const signer = await serviceOver(prisma).signerFor('relation-1');

    expect(signer.privateKey.type).toBe('private');
    expect(signer.privateKey.asymmetricKeyType).toBe('ed25519');
    expect(signer.key).toEqual({
      relationId: 'relation-1',
      keyId: 'proxy-key-1',
    });
    expect(Object.keys(signer).sort()).toEqual(['key', 'privateKey']);
    expect(JSON.stringify(signer)).not.toContain(
      fakeCipher.decrypt(storedCiphertext),
    );
  });

  it('produces exactly what sign() takes', async () => {
    const prisma = mockDeep<PrismaClient>();
    await withStoredKey(prisma);
    prisma.ownKey.findMany.mockResolvedValue([rowForListing()]);

    // Compile-time: `lint:typecheck` fails if the shape drifts from SignParams.
    const forSign: Pick<SignParams, 'key' | 'privateKey'> =
      await serviceOver(prisma).signerFor('relation-1');

    expect(forSign.privateKey).toBeInstanceOf(Object);
  });

  it('addresses the key by relation and keyId together', async () => {
    const prisma = mockDeep<PrismaClient>();
    await withStoredKey(prisma);
    prisma.ownKey.findMany.mockResolvedValue([rowForListing()]);

    await serviceOver(prisma).signerFor('relation-1');

    expect(prisma.ownKey.findUnique.mock.calls[0][0].where).toEqual({
      relationId_keyId: { relationId: 'relation-1', keyId: 'proxy-key-1' },
    });
  });

  it('skips a revoked key and signs with the valid one', async () => {
    const prisma = mockDeep<PrismaClient>();
    await withStoredKey(prisma);
    prisma.ownKey.findMany.mockResolvedValue([
      rowForListing({ keyId: 'retired-key', revokedAt: NOW }),
      rowForListing({ keyId: 'proxy-key-1' }),
    ]);

    const signer = await serviceOver(prisma).signerFor('relation-1');

    expect(signer.key.keyId).toBe('proxy-key-1');
  });

  it('refuses to sign for a relation that has no valid key', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.ownKey.findMany.mockResolvedValue([
      rowForListing({ revokedAt: NOW }),
    ]);

    await expect(serviceOver(prisma).signerFor('relation-1')).rejects.toThrow(
      /no valid signing key/i,
    );
    expect(prisma.ownKey.findUnique).not.toHaveBeenCalled();
  });

  it('refuses to guess when a relation has more than one valid key', async () => {
    // Two simultaneously valid keys can only mean a rotation, and which of
    // them signs is rotation policy (task 6.2). Picking one here would sign
    // with a key the peer may not have accepted yet.
    const prisma = mockDeep<PrismaClient>();
    prisma.ownKey.findMany.mockResolvedValue([
      rowForListing({ keyId: 'proxy-key-1' }),
      rowForListing({ keyId: 'proxy-key-2', supersededKeyId: 'proxy-key-1' }),
    ]);

    await expect(serviceOver(prisma).signerFor('relation-1')).rejects.toThrow(
      /more than one valid signing key/i,
    );
    expect(prisma.ownKey.findUnique).not.toHaveBeenCalled();
  });

  it('reports the row disappearing between the listing and the load', async () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.ownKey.findMany.mockResolvedValue([rowForListing()]);
    prisma.ownKey.findUnique.mockResolvedValue(null);

    await expect(serviceOver(prisma).signerFor('relation-1')).rejects.toThrow(
      /vanished/i,
    );
  });
});
