// The record kept for a registration code handed to a GROWI administrator
// (design.md's `pairing_order` table).
//
// **The code itself is never stored.** Only its hash reaches this repository,
// so a leaked database row does not hand an attacker something they could
// submit (Requirement 10.6). Hashing is the caller's job -- this layer is not
// where that choice should be made twice, and the plaintext code should not
// travel this far in the first place.
//
// `attempts` is incremented by the database rather than read-then-written by
// the caller, so two submissions arriving at once cannot both read the same
// count and write the same value, quietly doubling the number of guesses the
// limit allows.

import type { DbClient } from '../prisma-client.js';

/** Deliberately without `codeHash`: nothing downstream needs it back. */
export interface PairingOrderRecord {
  readonly id: string;
  readonly installationId: string;
  readonly attempts: number;
  readonly expiresAt: Date;
  readonly consumedAt: Date | null;
  /** The relation this code produced; `null` until it is consumed. */
  readonly relationId: string | null;
}

export interface PairingOrderRepository {
  issue(
    installationId: string,
    codeHash: string,
    expiresAt: Date,
  ): Promise<PairingOrderRecord>;
  findByCodeHash(codeHash: string): Promise<PairingOrderRecord | null>;
  /** Counts one submission and answers the new total. */
  recordAttempt(id: string): Promise<number>;
  /**
   * Records which relation this code produced, and answers whether THIS caller
   * was the one that did it.
   *
   * The update is conditional on `consumed_at` still being empty
   * (design.md: 「`consumed_at` を条件つき更新で立てた 1 本だけが先へ進む」).
   * `pairing/submit` carries neither a signature nor a nonce, so two copies of
   * one submission arriving together is the ordinary case, not the rare one;
   * an unconditional write would let both copies believe they had won and mint
   * a relation each. The loser reads the winner's `relationId` back and answers
   * with the same `PairingResult` instead.
   */
  consumeIfUnconsumed(
    id: string,
    relationId: string,
    consumedAt: Date,
  ): Promise<boolean>;
  /**
   * How many of an installation's codes are still usable -- not consumed, not
   * past their expiry, and not already at their attempt cap. The cap this
   * feeds is per installation (protocol design.md: 「installation ごとに、
   * 発行数と間違えた試行の回数に上限を置く」): every usable code is another
   * window in which a guess could land.
   *
   * `maxAttempts` is a parameter rather than a constant here because the cap
   * is declared by the caller (`relation/pairing-service.ts`), which is also
   * the one that enforces it on a submission. A code that has spent its
   * attempts answers nothing any more, so counting it would hold a slot no one
   * can use and leave an operator unable to ask for a working code until the
   * dead ones expire.
   */
  countLive(
    installationId: string,
    now: Date,
    maxAttempts: number,
  ): Promise<number>;
  /**
   * Deletes every order of an installation. Needed by
   * `InstallationStore.remove()` and by nothing else: `pairing_order` ->
   * `installation` is `Restrict`, so the installation row cannot be deleted
   * while an order remains. It is deliberately NOT part of unpairing --
   * `pairing_order` -> `relation` is `SetNull` there, which keeps the order as
   * history with its `relation_id` cleared (design.md's Data Models note).
   */
  deleteByInstallation(installationId: string): Promise<number>;
}

interface PairingOrderRow {
  readonly id: string;
  readonly installationId: string;
  readonly attempts: number;
  readonly expiresAt: Date;
  readonly consumedAt: Date | null;
  readonly relationId: string | null;
}

const toRecord = (row: PairingOrderRow): PairingOrderRecord => ({
  id: row.id,
  installationId: row.installationId,
  attempts: row.attempts,
  expiresAt: row.expiresAt,
  consumedAt: row.consumedAt,
  relationId: row.relationId,
});

export const createPairingOrderRepository = (
  db: DbClient,
): PairingOrderRepository => ({
  issue: async (installationId, codeHash, expiresAt) =>
    toRecord(
      await db.pairingOrder.create({
        data: { installationId, codeHash, expiresAt },
      }),
    ),

  findByCodeHash: async (codeHash) => {
    const row = await db.pairingOrder.findUnique({ where: { codeHash } });
    return row == null ? null : toRecord(row);
  },

  recordAttempt: async (id) => {
    const row = await db.pairingOrder.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
    return row.attempts;
  },

  consumeIfUnconsumed: async (id, relationId, consumedAt) => {
    // `updateMany` rather than `update`: only it accepts a non-unique `where`,
    // which is what makes the write conditional on `consumedAt` still being
    // null, and it answers with the number of rows it actually changed.
    const result = await db.pairingOrder.updateMany({
      where: { id, consumedAt: null },
      data: { relationId, consumedAt },
    });
    return result.count === 1;
  },

  countLive: async (installationId, now, maxAttempts) =>
    db.pairingOrder.count({
      where: {
        installationId,
        consumedAt: null,
        expiresAt: { gt: now },
        // `lt`, not `lte`: a submission is refused once the count PAST the
        // increment exceeds the cap, so a code with exactly `maxAttempts`
        // spent is already dead.
        attempts: { lt: maxAttempts },
      },
    }),

  deleteByInstallation: async (installationId) => {
    const result = await db.pairingOrder.deleteMany({
      where: { installationId },
    });
    return result.count;
  },
});
