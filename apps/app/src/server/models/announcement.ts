import {
  Types, Document, Schema, Model,
} from 'mongoose';

import { getOrCreateModel } from '../util/mongoose-utils';

enum AnnouncementStatuses {
  STATUS_UNREAD = 'UNREAD',
  STATUS_ALREADY_READ = 'ALREADY_READ',
  STATUS_IGNORED = 'IGNORED'
}

export interface AnnouncementDocument extends Document {
  _id: Types.ObjectId
  sender: Types.ObjectId
  name: string
  comment: string
  emoji: string
  isReadReceiptTrackingEnabled: boolean
  pageId: Types.ObjectId
  receivers: [
    {
      receiver: Types.ObjectId,
      updatedAt: Date,
      readStatus: AnnouncementStatuses,
    },
  ]
}

export interface AnnouncementModel extends Model<AnnouncementDocument> {
  getReadRate(receivers: [Types.ObjectId]): Promise<number | undefined>
}

const AnnouncementSchema = new Schema<AnnouncementDocument>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
  },
  emoji: {
    type: String,
    required: true,
  },
  isReadReceiptTrackingEnabled: {
    type: Boolean,
    required: true,
  },
  pageId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  receivers: [
    {
      receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      updatedAt: {
        type: Date,
      },
      readStatus: {
        type: String,
        enum: Object.values(AnnouncementStatuses),
        default: AnnouncementStatuses.STATUS_UNREAD,
      },
    },
  ],
}, {});

const Announcement = getOrCreateModel<AnnouncementDocument, AnnouncementModel>('Announcement', AnnouncementSchema);

export { Announcement };
