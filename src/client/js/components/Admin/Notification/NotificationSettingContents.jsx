import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';

import SlackAppConfiguration from './SlackAppConfiguration';
import UserTriggerNotification from './UserTriggerNotification';
import GlobalNotification from './GlobalNotification';


function NotificationSettingContents(props) {

  const [activeTab, setActiveTab] = useState('slack-configuration');
  const [activeComponents, setActiveComponents] = useState(new Set(['slack-configuration']));

  const toggleActiveTab = (activeTab) => {
    setActiveTab(activeTab);
    setActiveComponents(activeComponents.add(activeTab));
  };

  return (
    <React.Fragment>
      <Nav tabs>
        <NavItem>
          <NavLink
            className={`${activeTab === 'slack-configuration' && 'active'} `}
            onClick={() => { toggleActiveTab('slack-configuration') }}
            href="#slack-configuration"
          >
            <i className="icon-settings"></i> Slack configuration
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={`${activeTab === 'user-trigger-notification' && 'active'} `}
            onClick={() => { toggleActiveTab('user-trigger-notification') }}
            href="#user-trigger-notification"
          >
            <i className="icon-settings"></i> User trigger notification
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={`${activeTab === 'global-notification' && 'active'} `}
            onClick={() => { toggleActiveTab('global-notification') }}
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

NotificationSettingContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(NotificationSettingContents);
