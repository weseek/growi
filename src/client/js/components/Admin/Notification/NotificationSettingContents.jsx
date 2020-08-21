import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

import SlackAppConfiguration from './SlackAppConfiguration';
import UserTriggerNotification from './UserTriggerNotification';
import GlobalNotification from './GlobalNotification';


class NotificationSettingContents extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'slack-configuration',
      // Prevent unnecessary rendering
      activeComponents: new Set(['slack-configuration']),
    };

    this.toggleActiveTab = this.toggleActiveTab.bind(this);
  }

  toggleActiveTab(activeTab) {
    this.setState({
      activeTab, activeComponents: this.state.activeComponents.add(activeTab),
    });
  }

  render() {
    const { activeTab, activeComponents } = this.state;

    return (
      <React.Fragment>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={`${activeTab === 'slack-configuration' && 'active'} `}
              onClick={() => { this.toggleActiveTab('slack-configuration') }}
              href="#slack-configuration"
            >
              <i className="icon-settings"></i> Slack configuration
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`${activeTab === 'user-trigger-notification' && 'active'} `}
              onClick={() => { this.toggleActiveTab('user-trigger-notification') }}
              href="#user-trigger-notification"
            >
              <i className="icon-settings"></i> User trigger notification
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`${activeTab === 'global-notification' && 'active'} `}
              onClick={() => { this.toggleActiveTab('global-notification') }}
              href="#global-notification"
            >
              <i className="icon-settings"></i> Global notification
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="slack-configuration">
            {activeComponents.has('slack-configuration') && <SlackAppConfiguration />}
          </TabPane>
          <TabPane tabId="user-trigger-notification">
            {activeComponents.has('user-trigger-notification') && <UserTriggerNotification />}
          </TabPane>
          <TabPane tabId="global-notification">
            {activeComponents.has('global-notification') && <GlobalNotification />}
          </TabPane>
        </TabContent>
      </React.Fragment>
    );
  }

}

const NotificationSettingContentsWrapper = withUnstatedContainers(NotificationSettingContents, [AppContainer, AdminNotificationContainer]);

NotificationSettingContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(NotificationSettingContentsWrapper);
