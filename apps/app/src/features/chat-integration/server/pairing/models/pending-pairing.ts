import type mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';
import { Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

export interface IChatPendingPairing {
  /** Random code issued by the proxy and entered by the admin (Requirement 9.1/9.2). */
  registrationCode: string;

  proxyUri: string;

  /** GROWI URL as typed in by the admin (never used as signing material -- see design.md). */
  growiUri: string;

  createdBy: mongoose.Types.ObjectId;

  /**
   * The key pair generated for this pairing attempt is held here, NOT in
   * `chat_integration_keys`, because `relationId` (that collection's key
   * axis) does not exist yet at this point in the protocol -- see
   * design.md "ペアリングの途中に、自分の鍵を置く場所が要る（順序の矛盾）".
   * Moved into `chat_integration_keys` once `PairingResult.relationId` is
   * received; this row is deleted at that point.
   */
  ownKeyId: string;

  /**
   * Encrypted key pair (AES-256-GCM, same scheme as
   * `chat_integration_keys.key` for `side: 'own'`). Encryption itself is a
   * later task; declared here as an opaque string.
   */
  ownKeyPair: string;

  expiresAt: Date;
}

export interface ChatPendingPairingDocument
  extends IChatPendingPairing,
    Document {}

export interface ChatPendingPairingModel
  extends Model<ChatPendingPairingDocument> {}

const chatPendingPairingSchema = new Schema<
  ChatPendingPairingDocument,
  ChatPendingPairingModel
>(
  {
    registrationCode: { type: String, required: true },
    proxyUri: { type: String, required: true },
    growiUri: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ownKeyId: { type: String, required: true },
    ownKeyPair: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    collection: 'chat_pending_pairings',
    timestamps: false,
  },
);

chatPendingPairingSchema.index({ registrationCode: 1 }, { unique: true });
chatPendingPairingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ChatPendingPairing = getOrCreateModel<
  ChatPendingPairingDocument,
  ChatPendingPairingModel
>('ChatPendingPairing', chatPendingPairingSchema);
