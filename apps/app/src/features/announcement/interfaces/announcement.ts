import type {
  IUser, IPage, Ref, Nullable, HasObjectId,
} from '@growi/core';

import { AnnouncementStatuses } from '../announcement-utils';

type AnnouncementStatuses = typeof AnnouncementStatuses;

export interface IAnnouncement {
  sender: Ref<IUser>
  comment: Nullable<string>
  emoji: Nullable<string>
  isReadReceiptTrackingEnabled: boolean
  pageId: Ref<IPage>
  receivers: [
    {
      receiver: Ref<IUser>,
      updatedAt: Nullable<Date>,
      readStatus: AnnouncementStatuses,
    }
  ]
}

export type IAnnouncementHasId = IAnnouncement & HasObjectId;
