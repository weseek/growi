import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { TabContent, TabPane } from 'reactstrap';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';
import { withLoadingSppiner } from '../../SuspenseUtils';

import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';

import { CustomNavTab } from '../../CustomNavigation/CustomNav';

import UserTriggerNotification from './UserTriggerNotification';
import GlobalNotification from './GlobalNotification';

const logger = loggerFactory('growi:NotificationSetting');

let retrieveErrors = null;
function NotificationSetting(props) {
  const { adminNotificationContainer } = props;

  const [activeTab, setActiveTab] = useState('user_trigger_notification');
  const [activeComponents, setActiveComponents] = useState(new Set(['user_trigger_notification']));

  const switchActiveTab = (selectedTab) => {
    setActiveTab(selectedTab);
    setActiveComponents(activeComponents.add(selectedTab));
  };

  if (adminNotificationContainer.state.webhookUrl === adminNotificationContainer.dummyWebhookUrl) {
    throw (async() => {
      try {
        await adminNotificationContainer.retrieveNotificationData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        logger.error(errs);
        retrieveErrors = errs;
        adminNotificationContainer.setState({ webhookUrl: adminNotificationContainer.dummyWebhookUrlForError });
      }
    })();
  }

  if (adminNotificationContainer.state.webhookUrl === adminNotificationContainer.dummyWebhookUrlForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  const navTabMapping = useMemo(() => {
    return {
      user_trigger_notification: {
        Icon: () => <i className="icon-settings" />,
        i18n: 'User trigger notification',
        index: 0,
      },
      global_notification: {
        Icon: () => <i className="icon-settings" />,
        i18n: 'Global notification',
        index: 1,
      },
    };
  }, []);

  return (
    <>
      <CustomNavTab activeTab={activeTab} navTabMapping={navTabMapping} onNavSelected={switchActiveTab} hideBorderBottom />

      <TabContent activeTab={activeTab} className="p-5">
        <TabPane tabId="user_trigger_notification">
          {activeComponents.has('user_trigger_notification') && <UserTriggerNotification />}
        </TabPane>
        <TabPane tabId="global_notification">
          {activeComponents.has('global_notification') && <GlobalNotification />}
        </TabPane>
      </TabContent>
    </>
  );
}

const NotificationSettingWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(NotificationSetting), [AdminNotificationContainer]);

NotificationSetting.propTypes = {
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,
};

export default NotificationSettingWithUnstatedContainer;
