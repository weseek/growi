import type { IUser } from '@growi/core';
import { subDays } from 'date-fns';
import type { Types, FilterQuery, UpdateQuery } from 'mongoose';

import type { AnnouncementDocument } from '~/features/announcement';
import { AnnouncementStatuses, Announcement } from '~/features/announcement';

import type Crowi from '../crowi';
import type { ActivityDocument } from '../models/activity';


import { preNotifyService, type PreNotify } from './pre-notify';


const { STATUS_UNREAD, STATUS_ALREADY_READ, STATUS_IGNORED } = AnnouncementStatuses;

export default class AnnouncementService {

  crowi!: Crowi;

  constructor(crowi: Crowi) {
    this.crowi = crowi;

    this.getReadRate = this.getReadRate.bind(this);
    this.upsertByActivity = this.upsertByActivity.bind(this);
  }

  getReadRate = async() => {};

  upsertByActivity = async(
      users: Types.ObjectId[], activity: ActivityDocument, snapshot: string, createdAt?: Date | null,
  ): Promise<void> => {

    const {
      _id: activityId, targetModel, target, action,
    } = activity;

    const now = createdAt || Date.now();
    const lastWeek = subDays(now, 7);
    const operations = users.map((user) => {
      const filter: FilterQuery<AnnouncementDocument> = {
        user, target, action, createdAt: { $gt: lastWeek }, snapshot,
      };
      const parameters: UpdateQuery<AnnouncementDocument> = {
        user,
        targetModel,
        target,
        action,
        status: STATUS_UNREAD,
        createdAt: now,
        snapshot,
        $addToSet: { activities: activityId },
      };
      return {
        updateOne: {
          filter,
          update: parameters,
          upsert: true,
        },
      };
    });

    await Announcement.bulkWrite(operations);

    return;

  };

  createAnnouncement = async(activiy: ActivityDocument, target: IUser, preNotify: PreNotify): Promise<void> => {
    const props = preNotifyService.generateInitialPreNotifyProps();

    await preNotify(props);

    return;
  };

}
