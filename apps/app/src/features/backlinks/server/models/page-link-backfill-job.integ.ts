import { Types } from 'mongoose';

import type { Prisma } from '~/generated/prisma/client';
import { prisma } from '~/utils/prisma';

import { throwOnWriteErrors } from './throw-on-write-errors';

const COLLECTION = 'pagelinkbackfilljobs';
const LEASE_MS = 60_000;

// Writes the way the GROWI.cloud wave script (infra) and a crashed owner leave the document:
// a field-level $set straight into MongoDB, not through the model under test.
const patchJobDocument = async (set: Prisma.InputJsonObject): Promise<void> => {
  const result = await prisma.$runCommandRaw({
    update: COLLECTION,
    updates: [{ q: {}, u: { $set: set } }],
  });
  throwOnWriteErrors(result, 'test patch of the job document');
};

const expireLease = () =>
  patchJobDocument({ leaseExpiresAt: { $date: '2000-01-01T00:00:00Z' } });

const readJob = () => prisma.pagelinkbackfilljobs.findFirst({});

describe('pagelinkbackfilljobs (integration)', () => {
  beforeEach(async () => {
    await prisma.pagelinkbackfilljobs.deleteMany({});
  });

  describe('ensureExists', () => {
    it('creates one idle document that has not been asked to start', async () => {
      await prisma.pagelinkbackfilljobs.ensureExists();

      expect(await prisma.pagelinkbackfilljobs.count()).toBe(1);
      expect(await readJob()).toMatchObject({
        status: 'idle',
        phase: null,
        recentCutoff: null,
        progressMarker: null,
        recentProcessed: 0,
        olderProcessed: 0,
        startRequested: false,
        completedAt: null,
        lastError: null,
        claimedBy: null,
        leaseExpiresAt: null,
      });
    });

    it('leaves a start request and the progress fields untouched on a later boot', async () => {
      await prisma.pagelinkbackfilljobs.ensureExists();
      const marker = new Types.ObjectId();
      await patchJobDocument({
        startRequested: true,
        status: 'paused',
        phase: 'older',
        progressMarker: { $oid: marker.toString() },
        recentProcessed: 120,
        olderProcessed: 7,
      });

      await prisma.pagelinkbackfilljobs.ensureExists();

      expect(await prisma.pagelinkbackfilljobs.count()).toBe(1);
      expect(await readJob()).toMatchObject({
        startRequested: true,
        status: 'paused',
        phase: 'older',
        progressMarker: marker.toString(),
        recentProcessed: 120,
        olderProcessed: 7,
      });
    });

    it('leaves exactly one document when several instances boot at once', async () => {
      await Promise.all(
        Array.from({ length: 5 }, () =>
          prisma.pagelinkbackfilljobs.ensureExists(),
        ),
      );

      expect(await prisma.pagelinkbackfilljobs.count()).toBe(1);
    });
  });

  describe('tryClaim', () => {
    const recentCutoff = new Date('2026-01-01T00:00:00Z');

    beforeEach(async () => {
      await prisma.pagelinkbackfilljobs.ensureExists();
    });

    it('succeeds for the first claimant and rejects a second while the lease is live', async () => {
      const first = await prisma.pagelinkbackfilljobs.tryClaim('owner-a', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });
      const second = await prisma.pagelinkbackfilljobs.tryClaim('owner-b', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });

      expect(first).toBe(true);
      expect(second).toBe(false);
      expect(await readJob()).toMatchObject({
        claimedBy: 'owner-a',
        status: 'running',
      });
    });

    it('lets exactly one of several simultaneous claimants win', async () => {
      const results = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          prisma.pagelinkbackfilljobs.tryClaim(`owner-${i}`, {
            leaseMs: LEASE_MS,
            recentCutoff,
          }),
        ),
      );

      const winners = results.flatMap((won, i) => (won ? [`owner-${i}`] : []));
      expect(winners).toHaveLength(1);
      expect((await readJob())?.claimedBy).toBe(winners[0]);
    });

    it('lets a new claimant take over once the owner lease has expired', async () => {
      await prisma.pagelinkbackfilljobs.tryClaim('dead-owner', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });
      await expireLease();

      const takenOver = await prisma.pagelinkbackfilljobs.tryClaim('owner-b', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });

      expect(takenOver).toBe(true);
      expect((await readJob())?.claimedBy).toBe('owner-b');
    });

    it('lets the claim lapse on its own once the requested lease length has passed', async () => {
      await prisma.pagelinkbackfilljobs.tryClaim('short-lived', {
        leaseMs: 1,
        recentCutoff,
      });

      await vi.waitFor(
        async () => {
          const claimed = await prisma.pagelinkbackfilljobs.tryClaim('next', {
            leaseMs: LEASE_MS,
            recentCutoff,
          });
          expect(claimed).toBe(true);
        },
        { timeout: 2000, interval: 25 },
      );
    });

    it.each([
      'idle',
      'paused',
      'failed',
    ])('hands out an unclaimed %s job, so a paused or failed run can resume', async (status) => {
      await patchJobDocument({ status });

      const claimed = await prisma.pagelinkbackfilljobs.tryClaim('owner-a', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });

      expect(claimed).toBe(true);
      expect((await readJob())?.status).toBe('running');
    });

    it('never hands out a completed job, even when its lease has expired', async () => {
      await patchJobDocument({
        status: 'complete',
        claimedBy: 'old-owner',
      });
      await expireLease();

      const claimed = await prisma.pagelinkbackfilljobs.tryClaim('owner-b', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });

      expect(claimed).toBe(false);
      expect(await readJob()).toMatchObject({
        status: 'complete',
        claimedBy: 'old-owner',
      });
    });

    it('fixes the phase and recent cutoff at the first claim and keeps them on takeover', async () => {
      await prisma.pagelinkbackfilljobs.tryClaim('owner-a', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });
      await expireLease();

      await prisma.pagelinkbackfilljobs.tryClaim('owner-b', {
        leaseMs: LEASE_MS,
        recentCutoff: new Date('2027-06-01T00:00:00Z'),
      });

      expect(await readJob()).toMatchObject({
        phase: 'recent',
        recentCutoff,
      });
    });

    it('keeps the progress marker across a takeover', async () => {
      const marker = new Types.ObjectId();
      await prisma.pagelinkbackfilljobs.tryClaim('owner-a', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });
      await patchJobDocument({
        progressMarker: { $oid: marker.toString() },
        recentProcessed: 42,
      });
      await expireLease();

      await prisma.pagelinkbackfilljobs.tryClaim('owner-b', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });

      expect(await readJob()).toMatchObject({
        progressMarker: marker.toString(),
        recentProcessed: 42,
      });
    });

    it('does nothing when the job document does not exist', async () => {
      await prisma.pagelinkbackfilljobs.deleteMany({});

      const claimed = await prisma.pagelinkbackfilljobs.tryClaim('owner-a', {
        leaseMs: LEASE_MS,
        recentCutoff,
      });

      expect(claimed).toBe(false);
      expect(await prisma.pagelinkbackfilljobs.count()).toBe(0);
    });
  });
});
