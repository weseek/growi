import type {
  HasObjectId, Ref, IUser, IPage,
} from '@growi/core';
import { SubscriptionStatusType } from '@growi/core';
import { subDays } from 'date-fns';
import { Types, FilterQuery, UpdateQuery } from 'mongoose';


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

import Crowi from '../../crowi';
import { RoomPrefix, getRoomNameWithId } from '../../util/socket-io-helpers';

const { STATUS_UNREAD, STATUS_UNOPENED, STATUS_OPENED } = InAppNotificationStatuses;

const logger = loggerFactory('growi:service:inAppNotification');

export const emitSocketIo = async(targetUsers, socketIoService): Promise<void> => {
  if (socketIoService.isInitialized) {
    targetUsers.forEach(async(userId) => {

      // emit to the room for each user
      await socketIoService.getDefaultSocket()
        .in(getRoomNameWithId(RoomPrefix.USER, userId))
        .emit('notificationUpdated');
    });
  }
};

export const upsertByActivity = async function(
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
