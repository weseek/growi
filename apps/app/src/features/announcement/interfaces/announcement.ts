import type {
  IUser, IPage, Ref, HasObjectId,
} from '@growi/core';

import type { AnnouncementStatusesType } from '../server/events/announcement-utils';

export interface IAnnouncement {
  sender: Ref<IUser>
  comment?: string
  emoji?: string
  isReadReceiptTrackingEnabled: boolean
  pageId: string
  receivers:
  {
    receiver: Ref<IUser>,
    updatedAt?: Date,
    readStatus: AnnouncementStatusesType,
  }[]
}

export type IAnnouncementHasId = IAnnouncement & HasObjectId;

export interface ParamsForAnnouncement extends Omit<IAnnouncement, 'receivers'> {
  receivers: Ref<IUser>[]
}
