import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

import SlackAppConfiguration from './SlackAppConfiguration';
import UserTriggerNotification from './UserTriggerNotification';
import GlobalNotification from './GlobalNotification';

const logger = loggerFactory('growi:NotificationSetting');

class NotificationSetting extends React.Component {

  constructor() {
    super();

    this.state = {
      isRetrieving: true,
      activeTab: 'slack-configuration',
      // Prevent unnecessary rendering
      activeComponents: new Set(['slack-configuration']),
    };

    this.toggleActiveTab = this.toggleActiveTab.bind(this);
  }

  async componentDidMount() {
    const { adminNotificationContainer } = this.props;

    try {
      await adminNotificationContainer.retrieveNotificationData();
      this.setState({ isRetrieving: false });
    }
    catch (err) {
      toastError(err);
      adminNotificationContainer.setState({ retrieveError: err });
      logger.error(err);
    }

  }

  toggleActiveTab(activeTab) {
    this.setState({
      activeTab, activeComponents: this.state.activeComponents.add(activeTab),
    });
  }

  render() {
    if (this.state.isRetrieving) {
      return null;
    }

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

const NotificationSettingWrapper = withUnstatedContainers(NotificationSetting, [AppContainer, AdminNotificationContainer]);

NotificationSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(NotificationSettingWrapper);
