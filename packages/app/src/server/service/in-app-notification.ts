import { Types } from 'mongoose';
import { subDays } from 'date-fns';
import Crowi from '../crowi';
import { InAppNotification, InAppNotificationDocument, STATUS_UNREAD } from '~/server/models/in-app-notification';
import { ActivityDocument } from '~/server/models/activity';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:inAppNotification');


export default class InAppNotificationService {

  crowi!: Crowi;

  socketIoService!: any;

  commentEvent!: any;

  activityEvent!: any;


  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.socketIoService = crowi.socketIoService;
    this.activityEvent = crowi.event('activity');
  }


  emitSocketIo = async(user) => {
    if (this.socketIoService.isInitialized) {
      await this.socketIoService.getDefaultSocket().emit('comment updated', { user });
    }
  }

  upsertByActivity = async function(
      users: Types.ObjectId[], activity: ActivityDocument, createdAt?: Date | null,
  ): Promise<void> {
    const {
      _id: activityId, targetModel, target, action,
    } = activity;
    const now = createdAt || Date.now();
    const lastWeek = subDays(now, 7);
    const operations = users.map((user) => {
      const filter = {
        user, target, action, createdAt: { $gt: lastWeek },
      };
      const parameters = {
        user,
        targetModel,
        target,
        action,
        status: STATUS_UNREAD,
        createdAt: now,
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

    await InAppNotification.bulkWrite(operations);
    logger.info('InAppNotification bulkWrite has run');
    return;
  }

  // inAppNotificationSchema.virtual('actionUsers').get(function(this: InAppNotificationDocument) {
  //   const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);
  //   return Activity.getActionUsersFromActivities((this.activities as any) as ActivityDocument[]);
  // });

}

module.exports = InAppNotificationService;
