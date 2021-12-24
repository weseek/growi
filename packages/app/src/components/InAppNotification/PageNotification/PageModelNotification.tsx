import React, { FC, useCallback } from 'react';
import { PagePathLabel } from '@growi/ui';
import { useTranslation } from 'react-i18next';
import { apiv3Post } from '~/client/util/apiv3-client';
import { parseSnapshot } from '../../../models/serializers/in-app-notification-snapshot/page';
import { IInAppNotification } from '~/interfaces/in-app-notification';
import { HasObjectId } from '~/interfaces/has-object-id';
import FormattedDistanceDate from '../../FormattedDistanceDate';
import { toastWarning } from '~/client/util/apiNotification';

interface Props {
  notification: IInAppNotification & HasObjectId
  actionMsg: string
  actionIcon: string
  actionUsers: string
}

const PageModelNotification: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const {
    notification, actionMsg, actionIcon, actionUsers,
  } = props;

  const snapshot = parseSnapshot(notification.snapshot);
  const pagePath = { path: snapshot.path };

  const notificationClickHandler = useCallback(() => {
    // set notification status "OPEND"
    apiv3Post('/in-app-notification/open', { id: notification._id });

    // if target page exists jump to the page
    const targetPagePath = notification.target?.path;
    if (targetPagePath != null) {
      window.location.href = targetPagePath;
    }
    else {
      toastWarning(t('in_app_notification.page_not_exist'));
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
