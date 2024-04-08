import type {
  IUser, IPage, Ref, HasObjectId,
} from '@growi/core';

import type { AnnouncementStatuses } from '../features/announcement/server/events/announcement-utils';

type AnnouncementStatuses = typeof AnnouncementStatuses;

export interface IAnnouncement {
  sender: Ref<IUser>
  comment?: string
  emoji?: string
  isReadReceiptTrackingEnabled: boolean
  pageId: Ref<IPage>
  receivers: [
    {
      receiver: Ref<IUser>,
      updatedAt?: Date,
      readStatus: AnnouncementStatuses,
    }
  ]
}

export type IAnnouncementHasId = IAnnouncement & HasObjectId;
