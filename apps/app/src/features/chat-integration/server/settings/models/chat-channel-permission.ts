import type { CommandName } from '@growi/chat';
import type { Document, Model } from 'mongoose';
import { Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

export interface IChatChannelPermission {
  relationId: string;
  commandName: CommandName;
  /**
   * Channel ids this command is allowed to run from, for this relation.
   * `relationId` already pins the platform (one platform per relation), so
   * no separate platform field is needed per channel entry.
   */
  allowedChannels: string[];
}

export interface ChatChannelPermissionDocument
  extends IChatChannelPermission,
    Document {}

export interface ChatChannelPermissionModel
  extends Model<ChatChannelPermissionDocument> {}

const chatChannelPermissionSchema = new Schema<
  ChatChannelPermissionDocument,
  ChatChannelPermissionModel
>(
  {
    relationId: { type: String, required: true },
    commandName: { type: String, required: true },
    allowedChannels: { type: [String], required: true, default: [] },
  },
  {
    collection: 'chat_channel_permissions',
    // No per-row updatedAt: design.md is explicit that the single version
    // counter lives on `chat_relations.settingsVersion` instead, because
    // `SettingsPushRequest.version` is one value per relation, not per row
    // ("行ごとの `updatedAt` は持たない").
    timestamps: false,
  },
);

chatChannelPermissionSchema.index(
  { relationId: 1, commandName: 1 },
  { unique: true },
);

export const ChatChannelPermission = getOrCreateModel<
  ChatChannelPermissionDocument,
  ChatChannelPermissionModel
>('ChatChannelPermission', chatChannelPermissionSchema);
