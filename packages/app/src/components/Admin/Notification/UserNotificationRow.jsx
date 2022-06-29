import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';
import AppContainer from '~/client/services/AppContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

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

UserNotificationRow.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

  notification: PropTypes.object.isRequired,
  onClickDeleteBtn: PropTypes.func.isRequired,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const UserNotificationRowWrapperWrapperFC = (props) => {
  const { t } = useTranslation();

  return <UserNotificationRow t={t} {...props} />;
};

const UserNotificationRowWrapper = withUnstatedContainers(UserNotificationRowWrapperWrapperFC, [AppContainer, AdminNotificationContainer]);


export default UserNotificationRowWrapper;
