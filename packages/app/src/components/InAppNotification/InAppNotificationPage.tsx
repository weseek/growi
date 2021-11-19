import React, { FC, useState } from 'react';

import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';
import InAppNotificationList from './InAppNotificationList';
import { useSWRxInAppNotifications } from '../../stores/in-app-notification';
import PaginationWrapper from '../PaginationWrapper';
import CustomNavAndContents from '../CustomNavigation/CustomNavAndContents';
import { InAppNotificationStatuses } from '~/interfaces/in-app-notification';


type Props = {
  appContainer: AppContainer
}

const InAppNotificationPageBody: FC<Props> = (props) => {
  const { appContainer } = props;
  const limit = appContainer.config.pageLimitationXL;
  const [activePage, setActivePage] = useState(1);
  const offset = (activePage - 1) * limit;
  const { data: allNotificationData } = useSWRxInAppNotifications(limit, offset);

  const [activeUnopenedNotificationPage, setActiveUnopenedNotificationPage] = useState(1);
  const unopenedNotificationOffset = (activeUnopenedNotificationPage - 1) * limit;

  const { t } = useTranslation();

  if (allNotificationData == null) {
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
  };

  const setUnopenedPageNumber = (selectedPageNumber): void => {
    setActiveUnopenedNotificationPage(selectedPageNumber);
  };

  // commonize notification lists by 81953
  const AllInAppNotificationList = () => {
    return (
      <>
        <InAppNotificationList inAppNotificationData={allNotificationData} />
        <PaginationWrapper
          activePage={activePage}
          changePage={setPageNumber}
          totalItemsCount={allNotificationData.totalDocs}
          pagingLimit={allNotificationData.limit}
          align="center"
          size="sm"
        />
      </>
    );
  };

  // commonize notification lists by 81953
  const UnopenedInAppNotificationList = () => {
    const { data: unopendNotificationData } = useSWRxInAppNotifications(limit, unopenedNotificationOffset, InAppNotificationStatuses.STATUS_UNOPENED);

    if (unopendNotificationData == null) {
      return (
        <div className="wiki">
          <div className="text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-2 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-outline-primary"
            // TODO: set "UNOPENED" notification status "OPEND" by 81951
            // onClick={}
          >
            {t('in_app_notification.mark_all_as_read')}
          </button>
        </div>
        <InAppNotificationList inAppNotificationData={unopendNotificationData} />
        <PaginationWrapper
          activePage={activeUnopenedNotificationPage}
          changePage={setUnopenedPageNumber}
          totalItemsCount={unopendNotificationData.totalDocs}
          pagingLimit={unopendNotificationData.limit}
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
    external_accounts: {
      Icon: () => <></>,
      Content: UnopenedInAppNotificationList,
      i18n: t('in_app_notification.unopend'),
      index: 1,
    },
  };

  return (
    <CustomNavAndContents navTabMapping={navTabMapping} />
  );
};

const InAppNotificationPage = withUnstatedContainers(InAppNotificationPageBody, [AppContainer]);
export default InAppNotificationPage;

InAppNotificationPageBody.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};
