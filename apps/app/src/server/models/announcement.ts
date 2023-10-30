import type { IUserHasId } from '@growi/core';
import { Document } from 'mongoose';

enum AnnouncementStatuses {
  STATUS_UNREAD = 'UNREAD',
  STATUS_ALREADY_READ = 'ALREADY_READ',
  STATUS_IGNORED = 'IGNORED'
}

export interface AnnouncementDocument extends Document {
  sender: IUserHasId,
  name: string,
  comment: string,
  emoji: string,
  isReadReceiptTrackingEnabled: boolean,
  pageId,
  receivers: [
    {
      receiver: IUserHasId,
      updatedAt: Date,
      readStatus: AnnouncementStatuses,
    },
  ],
}
