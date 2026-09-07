import type { Document, Model } from 'mongoose';
import { Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

/**
 * 'own' -- this GROWI's own signing key, sent to the proxy.
 * 'peer' -- the proxy's public key, used to verify incoming requests.
 */
export type ChatIntegrationKeySide = 'own' | 'peer';

export interface IChatIntegrationKey {
  relationId: string;
  side: ChatIntegrationKeySide;
  keyId: string;
  /**
   * Opaque serialized key material. For `side: 'own'`, this is the
   * AES-256-GCM-encrypted private key (design.md "秘密鍵の暗号化は GROWI
   * に前例が無いので、この spec が仕組みごと決める") -- encryption/decryption
   * is out of scope for this task and is added by a later task; here the
   * field is declared as an opaque string so that later task can populate
   * it without a schema change.
   */
  key: string;
  validFrom: Date;
  /** Null while the key is still valid. */
  revokedAt: Date | null;
}

export interface ChatIntegrationKeyDocument
  extends IChatIntegrationKey,
    Document {}

export interface ChatIntegrationKeyModel
  extends Model<ChatIntegrationKeyDocument> {}

const chatIntegrationKeySchema = new Schema<
  ChatIntegrationKeyDocument,
  ChatIntegrationKeyModel
>(
  {
    relationId: { type: String, required: true },
    side: {
      type: String,
      enum: ['own', 'peer'] satisfies ChatIntegrationKeySide[],
      required: true,
    },
    keyId: { type: String, required: true },
    key: { type: String, required: true },
    validFrom: { type: Date, required: true, default: () => new Date() },
    revokedAt: { type: Date, default: null },
  },
  {
    collection: 'chat_integration_keys',
    timestamps: false,
  },
);

// A `keyId` alone can collide across relations (design.md "鍵の識別子も
// `(relationId, keyId)` の組で扱う"); `side` is added because own/peer keys
// are minted independently and could otherwise share a keyId value.
chatIntegrationKeySchema.index(
  { relationId: 1, side: 1, keyId: 1 },
  { unique: true },
);

export const ChatIntegrationKey = getOrCreateModel<
  ChatIntegrationKeyDocument,
  ChatIntegrationKeyModel
>('ChatIntegrationKey', chatIntegrationKeySchema);
