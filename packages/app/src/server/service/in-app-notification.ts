import { Types } from 'mongoose';
import { subDays } from 'date-fns';
import { InAppNotificationStatuses, PaginateResult } from '~/interfaces/in-app-notification';
import Crowi from '../crowi';
import {
  InAppNotification,
  InAppNotificationDocument,
} from '~/server/models/in-app-notification';

import { ActivityDocument } from '~/server/models/activity';
import InAppNotificationSettings from '~/server/models/in-app-notification-settings';
import Subscription from '~/server/models/subscription';

import { IUser } from '~/interfaces/user';

import { HasObjectId } from '~/interfaces/has-object-id';
import loggerFactory from '~/utils/logger';
import { RoomPrefix, getRoomNameWithId } from '../util/socket-io-helpers';
import { SubscriptionStatusType } from '~/interfaces/subscription';

const { STATUS_UNREAD, STATUS_UNOPENED, STATUS_OPENED } = InAppNotificationStatuses;

const logger = loggerFactory('growi:service:inAppNotification');


export default class InAppNotificationService {

  crowi!: Crowi;

  socketIoService!: any;

  commentEvent!: any;


  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.socketIoService = crowi.socketIoService;

    this.getUnreadCountByUser = this.getUnreadCountByUser.bind(this);
  }


  emitSocketIo = async(targetUsers) => {
    if (this.socketIoService.isInitialized) {
      targetUsers.forEach(async(userId) => {

        // emit to the room for each user
        await this.socketIoService.getDefaultSocket()
          .in(getRoomNameWithId(RoomPrefix.USER, userId))
          .emit('notificationUpdated');
      });
    }
  };

  upsertByActivity = async function(
      users: Types.ObjectId[], activity: ActivityDocument, snapshot: string, createdAt?: Date | null,
  ): Promise<void> {
    const {
      _id: activityId, targetModel, target, action,
    } = activity;
    const now = createdAt || Date.now();
    const lastWeek = subDays(now, 7);
    const operations = users.map((user) => {
      const filter = {
        user, target, action, createdAt: { $gt: lastWeek }, snapshot,
      };
      const parameters = {
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

    await InAppNotification.bulkWrite(operations);
    logger.info('InAppNotification bulkWrite has run');
    return;
  };

  getLatestNotificationsByUser = async(
      userId: Types.ObjectId,
      queryOptions: {offset: number, limit: number, status?: InAppNotificationStatuses},
  ): Promise<PaginateResult<InAppNotificationDocument>> => {
    const { limit, offset, status } = queryOptions;

    try {
      const pagenateOptions = { user: userId };
      if (status != null) {
        Object.assign(pagenateOptions, { status });
      }
      // TODO: import @types/mongoose-paginate-v2 and use PaginateResult as a type after upgrading mongoose v6.0.0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paginationResult = await (InAppNotification as any).paginate(
        pagenateOptions,
        {
          sort: { createdAt: -1 },
          limit,
          offset,
          populate: [
            { path: 'user' },
            { path: 'target' },
            { path: 'activities', populate: { path: 'user' } },
          ],
        },
      );

      return paginationResult;
    }
    catch (err) {
      logger.error('Error', err);
      throw new Error(err);
    }
  };

  read = async function(user: Types.ObjectId): Promise<void> {
    const query = { user, status: STATUS_UNREAD };
    const parameters = { status: STATUS_UNOPENED };
    await InAppNotification.updateMany(query, parameters);

    return;
  };

  open = async function(user: IUser & HasObjectId, id: Types.ObjectId): Promise<void> {
    const query = { _id: id, user: user._id };
    const parameters = { status: STATUS_OPENED };
    const options = { new: true };

    await InAppNotification.findOneAndUpdate(query, parameters, options);
    return;
  };

  updateAllNotificationsAsOpened = async function(user: IUser & HasObjectId): Promise<void> {
    const filter = { user: user._id, status: STATUS_UNOPENED };
    const options = { status: STATUS_OPENED };

    await InAppNotification.updateMany(filter, options);
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

  createSubscription = async function(userId: Types.ObjectId, pageId: Types.ObjectId, targetRuleName: string): Promise<void> {
    const query = { userId };
    const inAppNotificationSettings = await InAppNotificationSettings.findOne(query);
    if (inAppNotificationSettings != null) {
      const subscribeRule = inAppNotificationSettings.subscribeRules.find(subscribeRule => subscribeRule.name === targetRuleName);
      if (subscribeRule != null && subscribeRule.isEnabled) {
        await Subscription.subscribeByPageId(userId, pageId, SubscriptionStatusType.SUBSCRIBE);
      }
    }

    return;
  };

}

module.exports = InAppNotificationService;
