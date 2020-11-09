import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';
import { withLoadingSppiner } from '../../SuspenseUtils';

import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

import CustomNavigation from '../../CustomNavigation';

import SlackAppConfiguration from './SlackAppConfiguration';
import UserTriggerNotification from './UserTriggerNotification';
import GlobalNotification from './GlobalNotification';

const logger = loggerFactory('growi:NotificationSetting');

let retrieveErrors = null;
function NotificationSetting(props) {
  const { adminNotificationContainer, t } = props;
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
      slack_configuration: {
        Icon: () => <i className="icon-settings" />,
        Content: SlackAppConfiguration,
        i18n: 'Slack configuration',
        index: 0,
      },
      user_trigger_notification: {
        Icon: () => <i className="icon-settings" />,
        Content: UserTriggerNotification,
        i18n: 'User trigger notification',
        index: 1,
      },
      global_notification: {
        Icon: () => <i className="icon-settings" />,
        Content: GlobalNotification,
        i18n: 'Global notification',
        index: 2,
      },
    };
  }, []);

  return <CustomNavigation navTabMapping={navTabMapping} />;
}

const NotificationSettingWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(NotificationSetting), [AdminNotificationContainer]);

NotificationSetting.propTypes = {
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,
};

export default NotificationSettingWithUnstatedContainer;
