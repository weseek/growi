import type { IPage, IUser, IUserHasId } from '@growi/core';
import { subDays } from 'date-fns';
import type { Types, FilterQuery, UpdateQuery } from 'mongoose';

import type { AnnouncementDocument } from '~/features/announcement';
import { AnnouncementStatuses, Announcement } from '~/features/announcement';
import type { IAnnouncement } from '~/interfaces/announcement';

import type Crowi from '../crowi';
import type { ActivityDocument } from '../models/activity';


import type { PreNotifyProps } from './pre-notify';
import { preNotifyService, type PreNotify } from './pre-notify';


const { STATUS_UNREAD, STATUS_ALREADY_READ, STATUS_IGNORED } = AnnouncementStatuses;

export default class AnnouncementService {

  crowi!: Crowi;

  activityEvent: any;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');

    this.getReadRate = this.getReadRate.bind(this);
    this.insertByActivity = this.insertByActivity.bind(this);
    this.createAnnouncement = this.createAnnouncement.bind(this);

  }

  getReadRate = async() => {};

  insertByActivity = async(
      announcement: IAnnouncement,
  ): Promise<void> => {

    const operation = [{
      insertOne: {
        document: announcement,
      },
    }];

    await Announcement.bulkWrite(operation);

    return;

  };

  createAnnouncement = async(activity: ActivityDocument, target: IPage, receivers: IUserHasId[], announcement: IAnnouncement): Promise<void> => {

    this.insertByActivity(announcement);

    const preNotify = async(props: PreNotifyProps) => {

      const { notificationTargetUsers } = props;

      notificationTargetUsers?.push(...receivers);
    };

    this.activityEvent.emit('updated', activity, target, preNotify);

    return;
  };

}
