import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';


class GrobalNotification extends React.Component {

  render() {
    const { t, adminNotificationContainer } = this.props;
    const { grobalNotifications } = adminNotificationContainer.state;
    return (
      <React.Fragment>

        <a href="/admin/global-notification/new">
          <p className="btn btn-default">{t('notification_setting.add_notification')}</p>
        </a>

        <h2 className="border-bottom mb-5">{t('notification_setting.notification_list')}</h2>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ON/OFF</th>
              <th>{t('notification_setting.trigger_path')} {t('notification_setting.trigger_path_help', '<code>*</code>')}</th>
              <th>{t('notification_setting.trigger_events')}</th>
              <th>{t('notification_setting.notify_to')}</th>
              <th></th>
            </tr>
          </thead>
          {grobalNotifications.length !== 0 && (
            <tbody className="admin-notif-list">
              {grobalNotifications.map((notification) => {
                return (
                  <p>hoge</p>
                );
              })}
            </tbody>
          )}
        </table>

      </React.Fragment>
    );
  }

}

const GrobalNotificationWrapper = (props) => {
  return createSubscribedElement(GrobalNotification, props, [AppContainer, AdminNotificationContainer]);
};

GrobalNotification.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(GrobalNotificationWrapper);
