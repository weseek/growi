// This proxy's own signing keys, one set per relation (design.md's
// `RelationKeyService`, Requirements 9.5 / 9.6).
//
// Two properties are the reason this sits in `relation/` rather than in the
// storage layer:
//
//  - **A key belongs to one relation and to no other.** The keypair is minted
//    per relation, so one GROWI's private key leaking cannot be used against
//    any other GROWI the same workspace is paired with.
//  - **The key is written through the `DbClient` the caller supplied**, never
//    through a client this module reaches for itself. That is what lets
//    `PairingService` construct this service over the `tx` of its own
//    `$transaction`, alongside a `RelationRepository` over the same handle, and
//    get the `relation` row and its `own_key` row committed or rolled back
//    together (design.md: 「関係の行と鍵の行を同じトランザクションで書ける」).
//    The proxy mints `relationId` itself, so there is no ordering problem to
//    work around.
//
// **What leaves this layer is the means to sign, not key material.** The
// decrypted PEM exists only inside `own-key-repository`; `signerFor` returns
// the `KeyObject` that `sign()` takes, which callers hand on without ever
// unwrapping (Requirement 9.6).

import { generateKeyPairSync, type KeyObject, randomUUID } from 'node:crypto';
import { type KeyRef, SIGNATURE_ALGORITHM } from '@growi/chat/server';

import { createOwnKeyRepository, type DbClient } from '../db/index.js';
import type { SecretCipher } from '../types/index.js';

export interface RelationKeyService {
  /**
   * Mints this proxy's key for one relation and stores it. Called at pairing
   * time, from inside the transaction that writes the `relation` row.
   */
  issue(
    relationId: string,
  ): Promise<{ readonly keyId: string; readonly publicKeyJwk: JsonWebKey }>;
  /**
   * The relation's current signing key. Returns the means to sign; the
   * decrypted private key never exists outside `own-key-repository`.
   */
  signerFor(
    relationId: string,
  ): Promise<{ readonly key: KeyRef; readonly privateKey: KeyObject }>;
}

export interface RelationKeyServiceDeps {
  /**
   * Either the client or a transaction handle -- see the file header. Passing
   * a `tx` is how a caller makes the key share the pairing's unit of work.
   */
  readonly db: DbClient;
  readonly cipher: SecretCipher;
  /**
   * Defaults to a UUID. Injectable so a test can pin the value; the peer
   * checks the shape at registration (`isValidKeyIdShape`), which a UUID meets.
   */
  readonly generateKeyId?: () => string;
  readonly now?: () => Date;
}

export const createRelationKeyService = (
  deps: RelationKeyServiceDeps,
): RelationKeyService => {
  const ownKeys = createOwnKeyRepository(deps.db, deps.cipher);
  const generateKeyId = deps.generateKeyId ?? (() => randomUUID());
  const now = deps.now ?? (() => new Date());

  return {
    issue: async (relationId) => {
      const { publicKey, privateKey } =
        generateKeyPairSync(SIGNATURE_ALGORITHM);
      const keyId = generateKeyId();

      await ownKeys.issue(relationId, {
        keyId,
        privateKeyPem: privateKey
          .export({ type: 'pkcs8', format: 'pem' })
          .toString(),
        validFrom: now(),
        // Not a rotation: this is the relation's first key. Rotation (task
        // 6.2) is what fills this column in.
        supersededKeyId: null,
      });

      return { keyId, publicKeyJwk: publicKey.export({ format: 'jwk' }) };
    },

    signerFor: async (relationId) => {
      const keys = await ownKeys.listKeys(relationId);
      // Only `revokedAt` is read. `validFrom` is deliberately not compared
      // against the clock: nothing writes a future-dated key, and adding the
      // comparison would put a second, untested rule in front of signing.
      const valid = keys.filter((key) => key.revokedAt == null);

      if (valid.length === 0) {
        throw new Error(
          `No valid signing key for relation ${relationId}. A relation is paired with a key or not at all, so this means the key was revoked or deleted without the relation being removed.`,
        );
      }
      if (valid.length > 1) {
        // **Task 6.2 must replace this rule.** Rotation's first step writes
        // the new key while the old one is still valid, on purpose
        // (design.md: 「この時点で古い鍵も有効なまま」), and the old key is the
        // one that signs until every GROWI has accepted the new one. Until
        // that policy exists, picking either key here would sign with one the
        // peer may not hold -- so this refuses instead.
        const keyIds = valid.map((key) => key.keyId).join(', ');
        throw new Error(
          `Relation ${relationId} has more than one valid signing key (${keyIds}). Choosing between them is rotation policy, which this proxy does not implement yet.`,
        );
      }

      const signer = await ownKeys.loadSigner({
        relationId,
        keyId: valid[0].keyId,
      });
      if (signer == null) {
        // Distinct from the empty case above: the listing saw this row, so it
        // was deleted in between rather than never having existed.
        throw new Error(
          `Signing key ${valid[0].keyId} of relation ${relationId} vanished between listing and load.`,
        );
      }
      return signer;
    },
  };
};
