import type { Ref, IUser } from '@growi/core';
import { subDays } from 'date-fns';
import { FilterQuery, UpdateQuery } from 'mongoose';


import { InAppNotificationStatuses } from '~/interfaces/in-app-notification';
import { ActivityDocument } from '~/server/models/activity';
import {
  InAppNotification,
  InAppNotificationDocument,
} from '~/server/models/in-app-notification';
import loggerFactory from '~/utils/logger';

import { RoomPrefix, getRoomNameWithId } from '../../util/socket-io-helpers';

const { STATUS_UNREAD } = InAppNotificationStatuses;

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
    users: Ref<IUser>[], activity: ActivityDocument, snapshot: string, createdAt?: Date | null,
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
