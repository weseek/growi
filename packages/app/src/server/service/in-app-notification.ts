import { Types } from 'mongoose';
import { subDays } from 'date-fns';
import Crowi from '../crowi';
import {
  InAppNotification, InAppNotificationDocument, STATUS_UNREAD, STATUS_UNOPENED,
} from '~/server/models/in-app-notification';
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

    this.getUnreadCountByUser = this.getUnreadCountByUser.bind(this);
  }


  emitSocketIo = async(user) => {
    if (this.socketIoService.isInitialized) {
      const count = await this.getUnreadCountByUser(user);
      await this.socketIoService.getDefaultSocket().emit('InAppNotification count update', { user, count });
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

  getLatestNotificationsByUser = async(userId, limitNum, offset) => {

    try {
      const pagenatedInAppNotifications = await InAppNotification.paginate(
        { user: userId },
        {
          sort: { createdAt: -1 },
          offset,
          limit: limitNum || 10,
          populate: [
            { path: 'user' },
            { path: 'target' },
            { path: 'activities', populate: { path: 'user' } },
          ],
        },
      );
    }
    catch (err) {
      logger.error('Error', err);
      throw new Error(err);
    }

    try {
      /**
       * TODO: return results including notifications,hasPrev and hasNext by #78991
       * refer to https://github.com/crowi/crowi/blob/eecf2bc821098d2516b58104fe88fae81497d3ea/lib/controllers/notification.ts
       */
      // Notification.findLatestNotificationsByUser(user._id, requestLimit, offset)
      // .then(function (notifications) {
      //   let hasPrev = false
      //   if (offset > 0) {
      //     hasPrev = true
      //   }

      //   let hasNext = false
      //   if (notifications.length > limit) {
      //     hasNext = true
      //   }

      //   const result = {
      //     notifications: notifications.slice(0, limit),
      //     hasPrev: hasPrev,
      //     hasNext: hasNext,
      //   }

      //   return res.json(ApiResponse.success(result))
      // })
      // .catch(function (err) {
      //   return res.json(ApiResponse.error(err))
      // })

    }
    catch (err) {
      logger.error('Error', err);
      throw new Error(err);
    }
  }

  // inAppNotificationSchema.virtual('actionUsers').get(function(this: InAppNotificationDocument) {
  //   const Activity = getModelSafely('Activity') || require('../models/activity')(this.crowi);
  //   return Activity.getActionUsersFromActivities((this.activities as any) as ActivityDocument[]);
  // });

  read = async function(user: Types.ObjectId): Promise<void> {
    const query = { user, status: STATUS_UNREAD };
    const parameters = { status: STATUS_UNOPENED };
    await InAppNotification.updateMany(query, parameters);

    return;
  };

  getUnreadCountByUser = async function(user: Types.ObjectId): Promise<number| undefined> {
    const query = { user, status: STATUS_UNREAD };

    try {
      const count = await InAppNotification.countDocuments(query);

      return count;
    }
    catch (err) {
      logger.error('Error on getUnreadCountByUser', err);
      throw err;
    }
  };


}

module.exports = InAppNotificationService;
