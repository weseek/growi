// pageへの通知を司るオブジェクト
import type {
  HasObjectId, Ref, IUser, IPage,
} from '@growi/core';

import { AllEssentialActions, SupportedAction } from '~/interfaces/activity';
import * as pageSerializers from '~/models/serializers/in-app-notification-snapshot/page';
import { ActivityDocument } from '~/server/models/activity';

import { upsertByActivity, emitSocketIo } from './in-app-notification-utils';


class PageNotificationDelegator {

  activity: ActivityDocument;

  target;

  users: Ref<IUser>[];

  socketIoService;

  commentService;

  constructor(target, users, activity, socketIoService, commentService) {
    this.target = target;
    this.users = users;
    this.activity = activity;
    this.socketIoService = socketIoService;
    this.commentService = commentService;
  }

  createInAppNotification = async() => {
    const shouldNotification = this.activity != null && this.target != null && (AllEssentialActions as ReadonlyArray<string>).includes(this.activity.action);
    const snapshot = pageSerializers.stringifySnapshot(this.target);
    if (shouldNotification) {
      let mentionedUsers: IUser[] = [];
      if (this.activity.action === SupportedAction.ACTION_COMMENT_CREATE) {
        mentionedUsers = await this.commentService.getMentionedUsers(this.activity.event);
      }

      await upsertByActivity([...mentionedUsers, ...this.users], this.activity, snapshot);
      await emitSocketIo([this.users], this.socketIoService);
    }
    else {
      throw Error('No activity to notify');
    }
    return;
  };

}
