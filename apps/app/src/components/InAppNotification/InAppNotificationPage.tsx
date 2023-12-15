import React, {
  FC, useState, useEffect, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Put, apiv3Post } from '~/client/util/apiv3-client';
import { InAppNotificationStatuses } from '~/interfaces/in-app-notification';
import { useShowPageLimitationXL } from '~/stores/context';
import loggerFactory from '~/utils/logger';

import { useSWRxInAppNotifications, useSWRxInAppNotificationStatus } from '../../stores/in-app-notification';
import CustomNavAndContents from '../CustomNavigation/CustomNavAndContents';
import PaginationWrapper from '../PaginationWrapper';

import InAppNotificationList from './InAppNotificationList';


const logger = loggerFactory('growi:InAppNotificationPage');


export const InAppNotificationPage: FC = () => {
  const { t } = useTranslation('commons');
  const { mutate } = useSWRxInAppNotificationStatus();

  const { data: showPageLimitationXL } = useShowPageLimitationXL();

  const limit = showPageLimitationXL != null ? showPageLimitationXL : 20;

  const updateNotificationStatus = useCallback(async() => {
    try {
      await apiv3Post('/in-app-notification/read');
      mutate();
    }
    catch (err) {
      logger.error(err);
    }
  }, [mutate]);

  useEffect(() => {
    updateNotificationStatus();
  }, [updateNotificationStatus]);

  const InAppNotificationCategoryByStatus = (status?: InAppNotificationStatuses) => {
    const [activePage, setActivePage] = useState(1);
    const offset = (activePage - 1) * limit;

    let categoryStatus;

    switch (status) {
      case InAppNotificationStatuses.STATUS_UNOPENED:
        categoryStatus = InAppNotificationStatuses.STATUS_UNOPENED;
        break;
      default:
    }

    const { data: notificationData, mutate: mutateNotificationData } = useSWRxInAppNotifications(limit, offset, categoryStatus);
    const { mutate: mutateAllNotificationData } = useSWRxInAppNotifications(limit, offset, undefined);

    const setAllNotificationPageNumber = (selectedPageNumber): void => {
      setActivePage(selectedPageNumber);
    };


    if (notificationData == null) {
      return (
        <div className="wiki" data-testid="grw-in-app-notification-page-spinner">
          <div className="text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse me-1"></i>
          </div>
        </div>
      );
    }

    const updateUnopendNotificationStatusesToOpened = async() => {
      await apiv3Put('/in-app-notification/all-statuses-open');
      // mutate notification statuses in 'UNREAD' Category
      mutateNotificationData();
      // mutate notification statuses in 'ALL' Category
      mutateAllNotificationData();
    };


    return (
      <>
        {(status === InAppNotificationStatuses.STATUS_UNOPENED && notificationData.totalDocs > 0)
      && (
        <div className="mb-2 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={updateUnopendNotificationStatusesToOpened}
          >
            {t('in_app_notification.mark_all_as_read')}
          </button>
        </div>
      )}
        { notificationData != null && notificationData.docs.length === 0
          // no items
          ? t('in_app_notification.mark_all_as_read')
          // render list-group
          : (
            <div className="list-group">
              <InAppNotificationList inAppNotificationData={notificationData} type="button" elemClassName="list-group-item list-group-item-action" />
            </div>
          )
        }

        {notificationData.totalDocs > 0 && (
          <div className="mt-4">
            <PaginationWrapper
              activePage={activePage}
              changePage={setAllNotificationPageNumber}
              totalItemsCount={notificationData.totalDocs}
              pagingLimit={notificationData.limit}
              align="center"
              size="sm"
            />
          </div>
        ) }
      </>
    );
  };

  const navTabMapping = {
    user_infomation: {
      Icon: () => <></>,
      Content: () => InAppNotificationCategoryByStatus(),
      i18n: t('in_app_notification.all'),
    },
    external_accounts: {
      Icon: () => <></>,
      Content: () => InAppNotificationCategoryByStatus(InAppNotificationStatuses.STATUS_UNOPENED),
      i18n: t('in_app_notification.unopend'),
    },
  };

  return (
    <div data-testid="grw-in-app-notification-page">
      <CustomNavAndContents navTabMapping={navTabMapping} tabContentClasses={['mt-4']} />
    </div>
  );
};

InAppNotificationPage.displayName = 'InAppNotificationPage';
