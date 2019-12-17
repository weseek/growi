import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

class NotificationSetting extends React.Component {

  render() {

    return (
      <React.Fragment>
        <ul className="nav nav-tabs" role="tablist">
          <li role="tab" className="active">
            <a href="#slack-configuration" data-toggle="tab" role="tab"><i className="icon-settings"></i> Slack Configuration</a>
          </li>
          <li role="tab">
            <a href="#user-trigger-notification" data-toggle="tab" role="tab"><i className="icon-settings"></i> User Trigger Notification</a>
          </li>
          <li role="tab">
            <a href="#global-notification" data-toggle="tab" role="tab"><i className="icon-settings"></i> Global Notification</a>
          </li>
        </ul>

        <div className="tab-content m-t-15">
          <div id="slack-configuration" className="tab-pane active" role="tabpanel">
            {/* TODO GW-773 create slak config component */}
          </div>
          <div id="user-trigger-notification" className="tab-pane" role="tabpanel">
            {/* TODO GW-775 user trigger notification component */}
          </div>
          <div id="global-notification" className="tab-pane" role="tabpanel">
            {/* TODO GE-776 global notification component */}
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
