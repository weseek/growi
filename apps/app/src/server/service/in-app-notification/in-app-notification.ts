import type {
  HasObjectId, Ref, IUser,
} from '@growi/core';
import { SubscriptionStatusType } from '@growi/core';
import { Types } from 'mongoose';
import { T } from 'vitest/dist/types-dea83b3d';

import { AllEssentialActions } from '~/interfaces/activity';
import { InAppNotificationStatuses, PaginateResult } from '~/interfaces/in-app-notification';
import { ActivityDocument } from '~/server/models/activity';
import {
  InAppNotification,
  InAppNotificationDocument,
} from '~/server/models/in-app-notification';
import InAppNotificationSettings from '~/server/models/in-app-notification-settings';
import Subscription from '~/server/models/subscription';
import loggerFactory from '~/utils/logger';

import Crowi from '../../crowi';

import { getDelegator } from './in-app-notification-delegator';


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
    const targetModel = activity.targetModel;

    const socketIoService = this.crowi.socketIoService;
    const commentService = this.crowi.commentService;

    const delegator = getDelegator(targetModel); // getDelegatorで型に応じて適切なインスタンスを渡す

    delegator.createInAppNotification(activity, target, users, socketIoService, commentService);
  };

}

module.exports = InAppNotificationService;
