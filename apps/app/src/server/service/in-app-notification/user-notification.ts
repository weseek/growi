// userへの通知を司るオブジェクト

import type {
  HasObjectId, Ref, IUser, IPage,
} from '@growi/core';

import * as userSerializers from '~/models/serializers/in-app-notification-snapshot/user';
import { ActivityDocument } from '~/server/models/activity';

import { upsertByActivity, emitSocketIo } from './in-app-notification-utils';


class UserNotificationDelegator {

  activity: ActivityDocument;

  target;

  users: Ref<IUser>[];

  socketIoService;

  constructor(target, users, activity, socketIoService) {
    this.target = target;
    this.users = users;
    this.activity = activity;
    this.socketIoService = socketIoService;
  }

  createInAppNotification = async() => {
    const snapshot = userSerializers.stringifySnapshot(this.target);
    await upsertByActivity(this.users, this.activity, snapshot);
    await emitSocketIo(this.users, this.socketIoService);
    return;
  };

}
