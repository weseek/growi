import type { FC } from 'react';
import React from 'react';

import type { HasObjectId } from '@growi/core';
import { PagePathLabel } from '@growi/ui/dist/components';
import { useTranslation } from 'react-i18next';

import { SupportedAction, SupportedTargetModel } from '~/interfaces/activity';
import type { IInAppNotification } from '~/interfaces/in-app-notification';

import FormattedDistanceDate from '../../FormattedDistanceDate';

type Props = {
  notification: IInAppNotification & HasObjectId
  actionMsg: string
  actionIcon: string
  actionUsers: string
};

export const ModelNotification: FC<Props> = (props) => {
  const {
    notification, actionMsg, actionIcon, actionUsers,
  } = props;

  const { t } = useTranslation();

  return (
    <div className="p-2 overflow-hidden">
      <div className="text-truncate">
        {notification.targetModel !== SupportedTargetModel.MODEL_PAGE_BULK_EXPORT_JOB ? <b>{actionUsers}</b> : <></>}
        {` ${actionMsg}`}
        <PagePathLabel path={notification.parsedSnapshot?.path ?? ''} />
      </div>
      { (notification.action === SupportedAction.ACTION_PAGE_BULK_EXPORT_COMPLETED && notification.target == null)
        ? <div className="text-danger"><small>{t('page_export.bulk_export_download_expired')}</small></div> : <></> }
      <span className="material-symbols-outlined me-2">{actionIcon}</span>
      <FormattedDistanceDate
        id={notification._id}
        date={notification.createdAt}
        isShowTooltip={false}
        differenceForAvoidingFormat={Number.POSITIVE_INFINITY}
      />
    </div>
  );
};
