import React, { useCallback } from 'react';
import { PagePathLabel } from '@growi/ui';
import { apiv3Post } from '~/client/util/apiv3-client';
import { getSnapshotPagePath } from './snapshot';
import { IInAppNotification } from '~/interfaces/in-app-notification';
import { HasObjectId } from '~/interfaces/has-object-id';
import FormattedDistanceDate from '../../../FormattedDistanceDate';

interface Props {
  notification: IInAppNotification & HasObjectId
  actionMsg: string
  actionIcon: string
  actionUsers: string
}

const PageModelNotification = (props: Props): JSX.Element => {
  const {
    notification, actionMsg, actionIcon, actionUsers,
  } = props;

  const snapshot = getSnapshotPagePath(notification.snapshot);
  const pagePath = { path: snapshot };

  const notificationClickHandler = useCallback(() => {
    // set notification status "OPEND"
    apiv3Post('/in-app-notification/open', { id: notification._id });

    // jump to target page
    const targetPagePath = notification.target?.path;
    if (targetPagePath != null) {
      window.location.href = targetPagePath;
    }
  }, []);

  return (
    <div className="p-2">
      <div onClick={notificationClickHandler}>
        <div>
          <b>{actionUsers}</b> {actionMsg} <PagePathLabel page={pagePath} />
        </div>
        <i className={`${actionIcon} mr-2`} />
        <FormattedDistanceDate
          id={notification._id}
          date={notification.createdAt}
          isShowTooltip={false}
          differenceForAvoidingFormat={Number.POSITIVE_INFINITY}
        />
      </div>
    </div>
  );
};

export default PageModelNotification;
