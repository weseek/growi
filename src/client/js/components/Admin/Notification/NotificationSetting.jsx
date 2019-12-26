import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

import SlackAppConfiguration from './SlackAppConfiguration';
import UserTriggerNotification from './UserTriggerNotification';
import GlobalNotification from './GlobalNotification';

const logger = loggerFactory('growi:NotificationSetting');

class NotificationSetting extends React.Component {

  async componentDidMount() {
    const { adminNotificationContainer } = this.props;

    try {
      await adminNotificationContainer.retrieveNotificationData();
    }
    catch (err) {
      toastError(err);
      adminNotificationContainer.setState({ retrieveError: err });
      logger.error(err);
    }

  }

  render() {

    return (
      <React.Fragment>
        <div className="notification-settings">
          <ul className="nav nav-tabs" role="tablist">
            <li className="active">
              <a href="#slack-configuration" data-toggle="tab" role="tab"><i className="icon-settings"></i> Slack Configuration</a>
            </li>
            <li>
              <a href="#user-trigger-notification" data-toggle="tab" role="tab"><i className="icon-settings"></i> User Trigger Notification</a>
            </li>
            <li>
              <a href="#global-notification" data-toggle="tab" role="tab"><i className="icon-settings"></i> Global Notification</a>
            </li>
          </ul>
          <div className="tab-content m-t-15">
            <div id="slack-configuration" className="tab-pane active" role="tabpanel">
              <SlackAppConfiguration />
            </div>
            <div id="user-trigger-notification" className="tab-pane" role="tabpanel">
              <UserTriggerNotification />
            </div>
            <div id="global-notification" className="tab-pane" role="tabpanel">
              <GlobalNotification />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

const NotificationSettingWrapper = (props) => {
  return createSubscribedElement(NotificationSetting, props, [AppContainer, AdminNotificationContainer]);
};

NotificationSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(NotificationSettingWrapper);
