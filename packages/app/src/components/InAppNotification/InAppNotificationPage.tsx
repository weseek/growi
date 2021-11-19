import React, { FC, useState } from 'react';

import { useTranslation } from 'react-i18next';
import InAppNotificationList from './InAppNotificationList';
import { useSWRxInAppNotifications } from '../../stores/in-app-notification';
import PaginationWrapper from '../PaginationWrapper';
import CustomNavAndContents from '../CustomNavigation/CustomNavAndContents';


const InAppNotificationPage: FC = () => {
  const [activePage, setActivePage] = useState(1);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const { data: inAppNotificationData } = useSWRxInAppNotifications(limit, offset);
  const { t } = useTranslation();

  if (inAppNotificationData == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }


  const setPageNumber = (selectedPageNumber): void => {
    setActivePage(selectedPageNumber);
    const offset = (selectedPageNumber - 1) * limit;
    setOffset(offset);
  };

  const AllInAppNotificationList = () => {
    return (
      <>
        <InAppNotificationList inAppNotificationData={inAppNotificationData} />
        <PaginationWrapper
          activePage={activePage}
          changePage={setPageNumber}
          totalItemsCount={inAppNotificationData.totalDocs}
          pagingLimit={inAppNotificationData.limit}
          align="center"
          size="sm"
        />
      </>
    );
  };

  const UnReadInAppNotificationList = () => {
    return (
      <>
        <div className="mb-2 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-outline-primary"
            // TODO: set unopend notification status opend by 81951
            // onClick={}
          >
            {t('in_app_notification.mark_all_as_read')}
          </button>
        </div>
        {/*  TODO: show only unopened notifications by 81945 */}
        <InAppNotificationList inAppNotificationData={inAppNotificationData} />
        <PaginationWrapper
          activePage={activePage}
          changePage={setPageNumber}
          totalItemsCount={inAppNotificationData.totalDocs}
          pagingLimit={inAppNotificationData.limit}
          align="center"
          size="sm"
        />
      </>
    );
  };

  const navTabMapping = {
    user_infomation: {
      Icon: () => <></>,
      Content: AllInAppNotificationList,
      i18n: t('in_app_notification.all'),
      index: 0,
    },
    // TODO: show unopend notification list by 81945
    external_accounts: {
      Icon: () => <></>,
      Content: UnReadInAppNotificationList,
      i18n: t('in_app_notification.unopend'),
      index: 1,
    },
  };

  return (
    <CustomNavAndContents navTabMapping={navTabMapping} />
  );
};

export default InAppNotificationPage;
