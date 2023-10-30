import { Document } from 'mongoose';

enum AnnouncementStatuses {
  STATUS_UNREAD = 'UNREAD',
  STATUS_ALREADY_READ = 'ALREADY_READ',
  STATUS_IGNORED = 'IGNORED'
}

export interface AnnouncementDocument extends Document {
  sender,
  name: string,
  comment: string,
  emoji: string,
  isReadReceiptTrackingEnabled: boolean,
  pageId,
  receivers: [
    {
      receiver,
      updatedAt: Date,
      readStatus: AnnouncementStatuses,
    },
  ],
}
