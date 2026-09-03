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
   * Records which relation this code produced. Without it, submitting the same
   * code a second time could not answer with the same `PairingResult` and would
   * create a second relation instead (design.md's Data Models note).
   */
  consume(id: string, relationId: string, consumedAt: Date): Promise<void>;
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

  consume: async (id, relationId, consumedAt) => {
    await db.pairingOrder.update({
      where: { id },
      data: { relationId, consumedAt },
    });
  },

  deleteByInstallation: async (installationId) => {
    const result = await db.pairingOrder.deleteMany({
      where: { installationId },
    });
    return result.count;
  },
});
