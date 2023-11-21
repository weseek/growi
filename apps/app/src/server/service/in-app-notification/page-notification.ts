import type {
  Ref, IUser, IPage,
} from '@growi/core';

import { AllEssentialActions, SupportedAction } from '~/interfaces/activity';
import * as pageSerializers from '~/models/serializers/in-app-notification-snapshot/page';
import { ActivityDocument } from '~/server/models/activity';

import { generateInitialPreNotifyProps, type PreNotify, type PreNotifyProps } from '../preNotify';

import { upsertByActivity, emitSocketIo } from './in-app-notification-utils';


export class PageNotificationDelegator {

  target: IPage;

  constructor(target: IPage) {
    this.target = target;
  }

  createInAppNotification = async(activity: ActivityDocument, target, preNotify, socketIoService, commentService): Promise<void> => {
    const shouldNotification = activity != null && target != null && (AllEssentialActions as ReadonlyArray<string>).includes(activity.action);

    const snapshot = pageSerializers.stringifySnapshot(target);

    if (shouldNotification) {

      const props: PreNotifyProps = generateInitialPreNotifyProps();

      await preNotify(props);

      await this.upsertByActivity(props.notificationTargetUsers, activity, snapshot);
      await this.emitSocketIo(props.notificationTargetUsers);
    }
    else {
      throw Error('No activity to notify');
    }
    return;
  };

}
