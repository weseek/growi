import React, { FC, useState } from 'react';

import InAppNotificationList from './InAppNotificationList';
import { useSWRxInAppNotifications } from '../../stores/in-app-notification';
import PaginationWrapper from '../PaginationWrapper';


const AllInAppNotifications: FC = () => {
  const limit = 6;
  const [activePage, setActivePage] = useState(1);
  const { data: inAppNotificationData } = useSWRxInAppNotifications(limit);


  if (inAppNotificationData == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  function setPageNumber(selectedPageNumber): void {
    setActivePage(selectedPageNumber);
  }

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

export default AllInAppNotifications;
