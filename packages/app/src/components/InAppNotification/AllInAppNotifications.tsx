import React, { FC, useState, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import InAppNotificationList from './InAppNotificationList';
import { useSWRxInAppNotifications } from '../../stores/in-app-notification';
import PaginationWrapper from '../PaginationWrapper';
import CustomNavAndContents from '../CustomNavigation/CustomNavAndContents';

import UserSettings from '../Me/UserSettings';
import PasswordSettings from '../Me/PasswordSettings';


const AllInAppNotifications: FC = () => {
  const [activePage, setActivePage] = useState(1);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const { data: inAppNotificationData } = useSWRxInAppNotifications(limit, offset);
  const { t } = useTranslation();


  const navTabMapping = useMemo(() => {
    return {
      user_infomation: {
        Icon: () => <i className="icon-fw icon-user"></i>,
        Content: UserSettings,
        i18n: t('User Information'),
        index: 0,
      },
      external_accounts: {
        Icon: () => <i className="icon-fw icon-share-alt"></i>,
        Content: PasswordSettings,
        i18n: t('admin:user_management.external_accounts'),
        index: 1,
      },
    };
  }, [t]);

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

  return (
    <>
      <CustomNavAndContents navTabMapping={navTabMapping} />
      {/* <InAppNotificationList inAppNotificationData={inAppNotificationData} />
      <PaginationWrapper
        activePage={activePage}
        changePage={setPageNumber}
        totalItemsCount={inAppNotificationData.totalDocs}
        pagingLimit={inAppNotificationData.limit}
        align="center"
        size="sm"
      /> */}
    </>
  );
};

export default AllInAppNotifications;
