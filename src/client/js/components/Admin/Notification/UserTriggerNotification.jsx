import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import SlackAppConfiguration from './SlackAppConfiguration';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

class UserTriggerNotification extends React.Component {

  render() {
    return (
      <p>hoge</p>
    );
  }


}


const UserTriggerNotificationWrapper = (props) => {
  return createSubscribedElement(SlackAppConfiguration, props, [AppContainer, AdminNotificationContainer]);
};

UserTriggerNotification.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(UserTriggerNotificationWrapper);
