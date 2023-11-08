import type {
  Ref, IUser,
} from '@growi/core';

import { AllEssentialActions, SupportedAction } from '~/interfaces/activity';
import * as pageSerializers from '~/models/serializers/in-app-notification-snapshot/page';
import { ActivityDocument } from '~/server/models/activity';

import { upsertByActivity, emitSocketIo } from './in-app-notification-utils';


export class PageNotificationDelegator {

  createInAppNotification = async(activity: ActivityDocument, target, users: Ref<IUser>[], socketIoService, commentService): Promise<void> => {
    const shouldNotification = activity != null && target != null && (AllEssentialActions as ReadonlyArray<string>).includes(activity.action);
    const snapshot = pageSerializers.stringifySnapshot(target);
    if (shouldNotification) {
      let mentionedUsers: Ref<IUser>[] = [];
      if (activity.action === SupportedAction.ACTION_COMMENT_CREATE) {
        mentionedUsers = await commentService.getMentionedUsers(activity.event);
      }

      await upsertByActivity([...mentionedUsers, ...users], activity, snapshot);
      await emitSocketIo([users], socketIoService);
    }
    else {
      throw Error('No activity to notify');
    }
    return;
  };

}
