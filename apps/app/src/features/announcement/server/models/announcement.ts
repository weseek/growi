import type { Types, Document, Model } from 'mongoose';
import { Schema } from 'mongoose';

import { getOrCreateModel } from '../../../../server/util/mongoose-utils';
import type { IAnnouncement } from '../../interfaces/announcement';
import { AnnouncementStatuses } from '../events/announcement-utils';

export interface AnnouncementDocument extends IAnnouncement, Document {
  _id: Types.ObjectId
}

export interface AnnouncementModel extends Model<AnnouncementDocument> {
  getReadRate: () => Promise<number | undefined>
}

const AnnouncementSchema = new Schema<AnnouncementDocument>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  comment: {
    type: String,
  },
  emoji: {
    type: String,
  },
  isReadReceiptTrackingEnabled: {
    type: Boolean,
    required: true,
    default: false,
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
        required: true,
      },
    },
  ],
}, {});

const Announcement = getOrCreateModel<AnnouncementDocument, AnnouncementModel>('Announcement', AnnouncementSchema);

export { Announcement };
