import type {
  Ref, IUser,
} from '@growi/core';

import * as userSerializers from '~/models/serializers/in-app-notification-snapshot/user';
import { ActivityDocument } from '~/server/models/activity';

import { upsertByActivity, emitSocketIo } from './in-app-notification-utils';


export class UserNotificationDelegator {

  createInAppNotification = async(activity: ActivityDocument, target, users: Ref<IUser>[], socketIoService): Promise<void> => {
    const snapshot = userSerializers.stringifySnapshot(target);
    await upsertByActivity(users, activity, snapshot);
    await emitSocketIo(users, socketIoService);
    return;
  };

}
