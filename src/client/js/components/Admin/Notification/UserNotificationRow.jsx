import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

import NotificationTypeIcon from './NotificationTypeIcon';

class UserNotificationRow extends React.PureComponent {

  render() {
    const { t, notification } = this.props;
    const id = `user-notification-${notification._id}`;

    return (
      <React.Fragment>
        <tr className="admin-notif-row" key={id}>
          <td className="px-4">
            {notification.pathPattern}
          </td>
          <td className="px-4">
            <NotificationTypeIcon notification={notification} />{notification.channel}
          </td>
          <td>
            <button type="submit" className="btn btn-outline-danger" onClick={() => { this.props.onClickDeleteBtn(notification._id) }}>{t('Delete')}</button>
          </td>
        </tr>
      </React.Fragment>
    );

  }

}


const UserNotificationRowWrapper = withUnstatedContainers(UserNotificationRow, [AppContainer, AdminNotificationContainer]);

UserNotificationRow.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

  notification: PropTypes.object.isRequired,
  onClickDeleteBtn: PropTypes.func.isRequired,
};

export default withTranslation()(UserNotificationRowWrapper);
