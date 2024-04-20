import type {
  IUser, IPage, Ref, HasObjectId,
} from '@growi/core';

import type { AnnouncementStatusesType } from '../features/announcement/server/events/announcement-utils';

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
      readStatus: AnnouncementStatusesType,
    }
  ]
}

export type IAnnouncementHasId = IAnnouncement & HasObjectId;
