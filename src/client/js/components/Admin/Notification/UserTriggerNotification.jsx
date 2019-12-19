import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

class UserTriggerNotification extends React.Component {

  render() {
    return (
      <React.Fragment>
        <h2 className="border-bottom mb-5">Default Notification Settings for Patterns</h2>
      </React.Fragment>
    );
  }


}


const UserTriggerNotificationWrapper = (props) => {
  return createSubscribedElement(UserTriggerNotification, props, [AppContainer, AdminNotificationContainer]);
};

UserTriggerNotification.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(UserTriggerNotificationWrapper);
