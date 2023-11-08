import type {
  HasObjectId, Ref, IUser, IPage,
} from '@growi/core';
import { SubscriptionStatusType } from '@growi/core';
import { subDays } from 'date-fns';
import { Types, FilterQuery, UpdateQuery } from 'mongoose';
import { T } from 'vitest/dist/types-dea83b3d';

import { AllEssentialActions, SupportedAction } from '~/interfaces/activity';
import { InAppNotificationStatuses, PaginateResult } from '~/interfaces/in-app-notification';
import * as pageSerializers from '~/models/serializers/in-app-notification-snapshot/page';
import * as userSerializers from '~/models/serializers/in-app-notification-snapshot/user';
import { ActivityDocument } from '~/server/models/activity';
import {
  InAppNotification,
  InAppNotificationDocument,
} from '~/server/models/in-app-notification';
import InAppNotificationSettings from '~/server/models/in-app-notification-settings';
import Subscription from '~/server/models/subscription';
import loggerFactory from '~/utils/logger';

import Crowi from '../crowi';
import { RoomPrefix, getRoomNameWithId } from '../util/socket-io-helpers';


const { STATUS_UNREAD, STATUS_UNOPENED, STATUS_OPENED } = InAppNotificationStatuses;

const logger = loggerFactory('growi:service:inAppNotification');


export default class InAppNotificationService {

  crowi!: Crowi;

  socketIoService!: any;

  activityEvent!: any;

  commentEvent!: any;


  constructor(crowi: Crowi) {
    this.crowi = crowi;
    this.activityEvent = crowi.event('activity');
    this.socketIoService = crowi.socketIoService;

    this.emitSocketIo = this.emitSocketIo.bind(this);
    this.upsertByActivity = this.upsertByActivity.bind(this);
    this.getUnreadCountByUser = this.getUnreadCountByUser.bind(this);
    this.createInAppNotification = this.createInAppNotification.bind(this);

    this.initActivityEventListeners();
  }

  initActivityEventListeners(): void {
    // TODO: do not use any type
    // https://redmine.weseek.co.jp/issues/120632

    // descendantsSubscribers => users に変更された
    this.activityEvent.on('updated', async(activity: ActivityDocument, target: any, users: Ref<IUser>[]) => {
      try {
        const shouldNotification = activity != null && target != null && (AllEssentialActions as ReadonlyArray<string>).includes(activity.action);
        if (shouldNotification) {
          await this.createInAppNotification(activity, target, users);
        }
      }
      catch (err) {
        logger.error('Create InAppNotification failed', err);
      }
    });
  }

  emitSocketIo = async(targetUsers): Promise<void> => {
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
      const filter: FilterQuery<InAppNotificationDocument> = {
        user, target, action, createdAt: { $gt: lastWeek }, snapshot,
      };
      const parameters: UpdateQuery<InAppNotificationDocument> = {
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

  // TODO: do not use any type
  // https://redmine.weseek.co.jp/issues/120632
  createInAppNotification = async function(activity: ActivityDocument, target: T, users: Ref<IUser>[]): Promise<void> {
    if (activity.action === SupportedAction.ACTION_USER_REGISTRATION_APPROVAL_REQUEST) {
      const snapshot = userSerializers.stringifySnapshot(target);
      await this.upsertByActivity(users, activity, snapshot);
      await this.emitSocketIo(users);
      return;
    }

    const shouldNotification = activity != null && target != null && (AllEssentialActions as ReadonlyArray<string>).includes(activity.action);
    const snapshot = pageSerializers.stringifySnapshot(target);
    if (shouldNotification) {
      let mentionedUsers: IUser[] = [];
      if (activity.action === SupportedAction.ACTION_COMMENT_CREATE) {
        mentionedUsers = await this.crowi.commentService.getMentionedUsers(activity.event);
      }

      await this.upsertByActivity([...mentionedUsers, ...users], activity, snapshot);
      await this.emitSocketIo([users]);
    }
    else {
      throw Error('No activity to notify');
    }
    return;
    // delegater = getDelegater(); // getDelegatorで型に応じて適切なインスタンスを渡す

    // delegate.createInAppNotification(target: );
  };

}

module.exports = InAppNotificationService;
