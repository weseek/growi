import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';


class UserNotificationList extends React.Component {

  render() {
    const { t, adminNotificationContainer } = this.props;
    return (
      <React.Fragment>
        {adminNotificationContainer.state.userNotifications.map((notification) => {
          return (
            <tr className="admin-notif-row" key={notification._id}>
              <td>
                {notification.pathPattern}
              </td>
              <td>
                {notification.channel}
              </td>
              <td>
                {/* TODO GW-806 create apiV3 for delete notification */}
                <button type="submit" className="btn btn-default">{t('Delete')}</button>
              </td>
            </tr>
          );
        })
        }
      </React.Fragment>
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
