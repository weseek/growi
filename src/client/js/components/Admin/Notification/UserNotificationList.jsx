import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';


class UserNotificationList extends React.Component {

  render() {
    return (
      <p>hoge</p>
    );
  }

}


const UserNotificationListWrapper = (props) => {
  return createSubscribedElement(UserNotificationList, props, [AppContainer, AdminNotificationContainer]);
};

UserNotificationList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(UserNotificationListWrapper);
