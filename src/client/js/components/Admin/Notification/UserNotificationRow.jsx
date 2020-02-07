import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';


class UserNotificationRow extends React.PureComponent {

  render() {
    const { t, notification } = this.props;
    return (
      <React.Fragment>
        <tr className="admin-notif-row" key={notification._id}>
          <td>
            {notification.pathPattern}
          </td>
          <td>
            {notification.channel}
          </td>
          <td>
            <button type="submit" className="btn btn-default" onClick={() => { this.props.onClickDeleteBtn(notification._id) }}>{t('Delete')}</button>
          </td>
        </tr>
      </React.Fragment>
    );

  }

}


const UserNotificationRowWrapper = (props) => {
  return createSubscribedElement(UserNotificationRow, props, [AppContainer, AdminNotificationContainer]);
};

UserNotificationRow.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

  notification: PropTypes.object.isRequired,
  onClickDeleteBtn: PropTypes.func.isRequired,
};

export default withTranslation()(UserNotificationRowWrapper);
