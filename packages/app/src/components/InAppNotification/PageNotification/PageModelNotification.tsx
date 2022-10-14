import React, {
  forwardRef, ForwardRefRenderFunction, useImperativeHandle,
} from 'react';

import { HasObjectId } from '@growi/core';
import { PagePathLabel } from '@growi/ui';

import { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import { IInAppNotification } from '~/interfaces/in-app-notification';

import { parseSnapshot } from '../../../models/serializers/in-app-notification-snapshot/page';
import FormattedDistanceDate from '../../FormattedDistanceDate';

interface Props {
  notification: IInAppNotification & HasObjectId
  actionMsg: string
  actionIcon: string
  actionUsers: string
}

const PageModelNotification: ForwardRefRenderFunction<IInAppNotificationOpenable, Props> = (props: Props, ref) => {

  const {
    notification, actionMsg, actionIcon, actionUsers,
  } = props;

  const snapshot = parseSnapshot(notification.snapshot);

  // publish open()
  useImperativeHandle(ref, () => ({
    open() {
      if (notification.target != null) {
        // jump to target page
        const targetPagePath = notification.target.path;
        if (targetPagePath != null) {
          window.location.href = targetPagePath;
        }
      }
    },
  }));

  return (
    <div className="p-2 overflow-hidden">
      <div className="text-truncate">
        <b>{actionUsers}</b> {actionMsg} <PagePathLabel path={snapshot.path} />
      </div>
      <i className={`${actionIcon} mr-2`} />
      <FormattedDistanceDate
        id={notification._id}
        date={notification.createdAt}
        isShowTooltip={false}
        differenceForAvoidingFormat={Number.POSITIVE_INFINITY}
      />
    </div>
  );
};

export default forwardRef(PageModelNotification);
