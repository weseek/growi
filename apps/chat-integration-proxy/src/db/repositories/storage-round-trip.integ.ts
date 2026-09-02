// Task 2.1's acceptance criterion, against a real PostgreSQL: 「保存して読み直
// すと同じ値が返り、暗号化した列が保存の上では読めない」.
//
// This cannot be answered by a mocked Prisma client. "The same value comes
// back" is a claim about a real column with a real type, and "the encrypted
// column is unreadable in storage" is a claim about the bytes PostgreSQL
// actually holds -- which is why the assertions below read those two columns
// back with `$queryRaw`, going around the repositories entirely.
//
// The connection string is read from the environment the same way (and for the
// same reason) `src/postgres-connectivity.integ.ts` reads it: `runtime/config.ts`
// is the only file in the *application* allowed to read env vars, and this is a
// test rather than application code. The default mirrors `.env.development`, so
// this runs for a developer who has not sourced that file.
import { generateKeyPairSync, randomUUID, sign, verify } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';

import type { InstallationCredentials } from '../../types/index.js';
import { createPrismaClient, type PrismaClient } from '../prisma-client.js';
import { createInstallationRepository } from './installation-repository.js';
import { createOwnKeyRepository } from './own-key-repository.js';
import { createPairingOrderRepository } from './pairing-order-repository.js';
import { createPeerKeyRepository } from './peer-key-repository.js';
import { createRelationRepository } from './relation-repository.js';
import { testCipher } from './test-cipher.js';

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://chat_integration_proxy:chat_integration_proxy_dev@postgres:5432/chat_integration_proxy';

const BOT_TOKEN = `xoxb-${randomUUID()}`;
const CREDENTIALS: InstallationCredentials = { slack: { botToken: BOT_TOKEN } };

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const PRIVATE_PEM = privateKey
  .export({ type: 'pkcs8', format: 'pem' })
  .toString();
const PUBLIC_JWK = publicKey.export({ format: 'jwk' }) as JsonWebKey;

// A workspace id unique to this run, so repeated runs (and parallel workers)
// never collide on `(platform, workspace_id)`.
const WORKSPACE_ID = `T-${randomUUID()}`;
const VALID_FROM = new Date('2026-01-01T00:00:00.000Z');

/**
 * Connecting and creating the installation every test hangs off, done once and
 * shared. Deliberately NOT a `beforeAll`: a failing `beforeAll` *skips* the
 * test bodies, so while `postgres` is unreachable not one assertion below would
 * ever be parsed and run, and a mistake in one of them would stay hidden until
 * long after this task closed. Called from inside each test instead, the same
 * shape `postgres-connectivity.integ.ts` uses -- every test then fails on its
 * own with the real connection error.
 */
let shared: Promise<{ prisma: PrismaClient; installationId: string }> | null =
  null;

const context = (): Promise<{
  prisma: PrismaClient;
  installationId: string;
}> => {
  shared ??= (async () => {
    const prisma = createPrismaClient(DATABASE_URL);
    const installations = createInstallationRepository(prisma, testCipher);
    const installationId = await installations.save(
      'slack',
      WORKSPACE_ID,
      'Acme',
      CREDENTIALS,
    );
    return { prisma, installationId };
  })();
  return shared;
};

describe('storage round trip through real PostgreSQL (Requirements 8.1, 10.5, 10.6)', () => {
  afterAll(async () => {
    if (shared == null) return;
    let prisma: PrismaClient;
    let installationId: string;
    try {
      ({ prisma, installationId } = await shared);
    } catch {
      // Never connected, so there is nothing to clean up. Swallowed on purpose:
      // re-reporting it here would bury the failure the tests themselves show.
      return;
    }

    // The explicit order matters: every foreign key onto `relation` here is
    // `Restrict`, so the children have to go first (design.md's unpairing
    // sequence, applied to leave no test rows behind).
    const relations = await prisma.relation.findMany({
      where: { installationId },
      select: { id: true },
    });
    const relationIds = relations.map((relation) => relation.id);
    await prisma.pairingOrder.updateMany({
      where: { installationId },
      data: { relationId: null },
    });
    await prisma.ownKey.deleteMany({
      where: { relationId: { in: relationIds } },
    });
    await prisma.peerKey.deleteMany({
      where: { relationId: { in: relationIds } },
    });
    await prisma.relation.deleteMany({ where: { installationId } });
    await prisma.pairingOrder.deleteMany({ where: { installationId } });
    await prisma.installation.deleteMany({ where: { id: installationId } });
    await prisma.$disconnect();
  });

  it('reads back the credentials that were saved (Requirement 10.6)', async () => {
    const { prisma } = await context();
    const installations = createInstallationRepository(prisma, testCipher);

    await expect(
      installations.resolveCredentials('slack', WORKSPACE_ID),
    ).resolves.toEqual(CREDENTIALS);
  });

  it('leaves the stored credentials column unreadable (Requirement 10.6)', async () => {
    const { prisma, installationId } = await context();
    const [stored] = await prisma.$queryRaw<
      Array<{ credentials: string }>
    >`SELECT credentials FROM installation WHERE id = ${installationId}::uuid`;

    expect(stored.credentials).not.toBe(JSON.stringify(CREDENTIALS));
    expect(stored.credentials).not.toContain(BOT_TOKEN);
    expect(stored.credentials).not.toContain('botToken');
  });

  it('keeps several GROWI pairings under one workspace apart (Requirement 8.1)', async () => {
    const { prisma, installationId } = await context();
    const relations = createRelationRepository(prisma);

    const first = await relations.create({
      installationId,
      growiUri: `https://first-${WORKSPACE_ID}.example.com`,
      growiLabel: 'First',
      searchWeight: 1,
      settingsVersion: 0,
    });
    const second = await relations.create({
      installationId,
      growiUri: `https://second-${WORKSPACE_ID}.example.com`,
      growiLabel: 'Second',
      searchWeight: 5,
      settingsVersion: 0,
    });

    expect(second.relationId).not.toBe(first.relationId);
    await expect(relations.findById(first.relationId)).resolves.toEqual(first);

    const listed = await relations.listByInstallation(installationId);
    expect(listed.map((relation) => relation.relationId).sort()).toEqual(
      [first.relationId, second.relationId].sort(),
    );

    // The same GROWI cannot be paired twice with the same workspace.
    await expect(
      relations.create({
        installationId,
        growiUri: `https://first-${WORKSPACE_ID}.example.com`,
        growiLabel: 'Duplicate',
        searchWeight: 1,
        settingsVersion: 0,
      }),
    ).rejects.toThrow();
  });

  it('reads back a peer public key, and refuses it once revoked (Requirement 10.5)', async () => {
    const { prisma, installationId } = await context();
    const relations = createRelationRepository(prisma);
    const peerKeys = createPeerKeyRepository(prisma);
    const relation = await relations.create({
      installationId,
      growiUri: `https://peer-${WORKSPACE_ID}.example.com`,
      growiLabel: 'Peer',
      searchWeight: 1,
      settingsVersion: 0,
    });
    const ref = { relationId: relation.relationId, keyId: 'growi-key-1' };

    await peerKeys.register(relation.relationId, {
      keyId: 'growi-key-1',
      publicKeyJwk: PUBLIC_JWK,
      validFrom: VALID_FROM.toISOString(),
    });

    const loaded = await peerKeys.findPublicKey(ref, new Date());
    expect(loaded?.export({ format: 'jwk' })).toEqual(PUBLIC_JWK);

    await peerKeys.revoke(ref, new Date());
    await expect(peerKeys.findPublicKey(ref, new Date())).resolves.toBeNull();
  });

  it('signs with a stored private key that never leaves storage in the clear (Requirement 10.6)', async () => {
    const { prisma, installationId } = await context();
    const relations = createRelationRepository(prisma);
    const ownKeys = createOwnKeyRepository(prisma, testCipher);
    const relation = await relations.create({
      installationId,
      growiUri: `https://own-${WORKSPACE_ID}.example.com`,
      growiLabel: 'Own',
      searchWeight: 1,
      settingsVersion: 0,
    });
    const ref = { relationId: relation.relationId, keyId: 'proxy-key-1' };

    await ownKeys.issue(relation.relationId, {
      keyId: 'proxy-key-1',
      privateKeyPem: PRIVATE_PEM,
      validFrom: VALID_FROM,
      supersededKeyId: null,
    });

    const signer = await ownKeys.loadSigner(ref);
    expect(signer).not.toBeNull();
    if (signer == null) return;
    expect(signer.privateKey.asymmetricKeyType).toBe('ed25519');

    // The key that comes back is the key that was stored: a signature it makes
    // verifies against the public half of the same pair. Comparing PEM strings
    // would not be possible here -- and that is the point of this repository.
    const message = Buffer.from('round trip');
    const signature = sign(null, message, signer.privateKey);
    expect(verify(null, message, publicKey, signature)).toBe(true);

    const [stored] = await prisma.$queryRaw<
      Array<{ private_key_pem: string }>
    >`SELECT private_key_pem FROM own_key WHERE relation_id = ${relation.relationId}::uuid`;
    expect(stored.private_key_pem).not.toContain('BEGIN PRIVATE KEY');
    expect(stored.private_key_pem).not.toContain(PRIVATE_PEM);
  });

  it('keeps a rotation’s two keys valid at once, without key material in the listing (Requirement 10.5)', async () => {
    const { prisma, installationId } = await context();
    const relations = createRelationRepository(prisma);
    const ownKeys = createOwnKeyRepository(prisma, testCipher);
    const relation = await relations.create({
      installationId,
      growiUri: `https://rotate-${WORKSPACE_ID}.example.com`,
      growiLabel: 'Rotate',
      searchWeight: 1,
      settingsVersion: 0,
    });

    await ownKeys.issue(relation.relationId, {
      keyId: 'proxy-key-1',
      privateKeyPem: PRIVATE_PEM,
      validFrom: VALID_FROM,
      supersededKeyId: null,
    });
    await ownKeys.issue(relation.relationId, {
      keyId: 'proxy-key-2',
      privateKeyPem: PRIVATE_PEM,
      validFrom: new Date(),
      supersededKeyId: 'proxy-key-1',
    });

    const keys = await ownKeys.listKeys(relation.relationId);
    expect(keys.map((key) => key.keyId).sort()).toEqual([
      'proxy-key-1',
      'proxy-key-2',
    ]);
    expect(keys.every((key) => key.revokedAt == null)).toBe(true);
    expect(JSON.stringify(keys)).not.toContain('PRIVATE KEY');

    // Both keys are still addressable for signing while the rotation is in
    // flight -- the old one is what the peer can still verify.
    await expect(
      ownKeys.loadSigner({
        relationId: relation.relationId,
        keyId: 'proxy-key-1',
      }),
    ).resolves.not.toBeNull();
  });

  it('reads back a registration code’s record without ever storing the code', async () => {
    const { prisma, installationId } = await context();
    const pairingOrders = createPairingOrderRepository(prisma);
    const codeHash = `hash-${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 600_000);

    const issued = await pairingOrders.issue(
      installationId,
      codeHash,
      expiresAt,
    );

    const found = await pairingOrders.findByCodeHash(codeHash);
    expect(found).toEqual({
      id: issued.id,
      installationId,
      attempts: 0,
      expiresAt,
      consumedAt: null,
      relationId: null,
    });
    expect(await pairingOrders.recordAttempt(issued.id)).toBe(1);
  });
});
