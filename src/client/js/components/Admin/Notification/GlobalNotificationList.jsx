import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import urljoin from 'url-join';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';
import NotificationDeleteModal from './NotificationDeleteModal';

const logger = loggerFactory('growi:GolobalNotificationList');

class GlobalNotificationList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isConfirmationModalOpen: false,
      notificationForConfiguration: null,
    };

    this.openConfirmationModal = this.openConfirmationModal.bind(this);
    this.closeConfirmationModal = this.closeConfirmationModal.bind(this);
    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async toggleIsEnabled(notification) {
    const { t } = this.props;
    const isEnabled = !notification.isEnabled;
    try {
      await this.props.appContainer.apiv3.put(`/notification-setting/global-notification/${notification._id}/enabled`, {
        isEnabled,
      });
      toastSuccess(t('notification_setting.toggle_notification', { path: notification.triggerPath }));
      await this.props.adminNotificationContainer.retrieveNotificationData();
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  openConfirmationModal(notification) {
    this.setState({ isConfirmationModalOpen: true, notificationForConfiguration: notification });
  }

  closeConfirmationModal() {
    this.setState({ isConfirmationModalOpen: false, notificationForConfiguration: null });
  }

  async onClickSubmit() {
    const { t, adminNotificationContainer } = this.props;

    try {
      const deletedNotificaton = await adminNotificationContainer.deleteGlobalNotificationPattern(this.state.notificationForConfiguration._id);
      toastSuccess(t('notification_setting.delete_notification_pattern', { path: deletedNotificaton.triggerPath }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
    this.setState({ isConfirmationModalOpen: false });
  }

  render() {
    const { t, adminNotificationContainer } = this.props;
    const { globalNotifications } = adminNotificationContainer.state;

    return (
      <React.Fragment>
        {globalNotifications.map((notification) => {
          return (
            <tr key={notification._id}>
              <td className="align-middle td-abs-center">
                <div className="custom-control custom-switch custom-checkbox-success">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id={notification._id}
                    defaultChecked={notification.isEnabled}
                    onClick={() => this.toggleIsEnabled(notification)}
                  />
                  <label className="custom-control-label" htmlFor={notification._id} />
                </div>
              </td>
              <td>
                {notification.triggerPath}
              </td>
              <td>
                <ul className="list-inline">
                  {notification.triggerEvents.includes('pageCreate') && (
                  <li className="list-inline-item badge badge-pill badge-success" data-toggle="tooltip" data-placement="top" title="Page Create">
                    <i className="icon-doc"></i> CREATE
                  </li>
                )}
                  {notification.triggerEvents.includes('pageEdit') && (
                  <li className="list-inline-item badge badge-pill badge-warning" data-toggle="tooltip" data-placement="top" title="Page Edit">
                    <i className="icon-pencil"></i> EDIT
                  </li>
                )}
                  {notification.triggerEvents.includes('pageMove') && (
                  <li className="list-inline-item badge badge-pill badge-pink" data-toggle="tooltip" data-placement="top" title="Page Move">
                    <i className="icon-action-redo"></i> MOVE
                  </li>
                )}
                  {notification.triggerEvents.includes('pageDelete') && (
                  <li className="list-inline-item badge badge-pill badge-danger" data-toggle="tooltip" data-placement="top" title="Page Delte">
                    <i className="icon-fire"></i> DELETE
                  </li>
                )}
                  {notification.triggerEvents.includes('pageLike') && (
                  <li className="list-inline-item badge badge-pill badge-info" data-toggle="tooltip" data-placement="top" title="Page Like">
                    <i className="icon-like"></i> LIKE
                  </li>
                )}
                  {notification.triggerEvents.includes('comment') && (
                  <li className="list-inline-item badge badge-pill badge-secondary" data-toggle="tooltip" data-placement="top" title="New Comment">
                    <i className="icon-fw icon-bubble"></i> POST
                  </li>
                )}
                </ul>
              </td>
              <td>
                {notification.__t === 'mail'
                  && <span data-toggle="tooltip" data-placement="top" title="Email"><i className="ti-email"></i> {notification.toEmail}</span>}
                {notification.__t === 'slack'
                  && <span data-toggle="tooltip" data-placement="top" title="Slack"><i className="fa fa-hashtag"></i> {notification.slackChannels}</span>}
              </td>
              <td className="td-abs-center">
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <i className="icon-settings"></i> <span className="caret"></span>
                  </button>
                  <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                    <a className="dropdown-item" href={urljoin('/admin/global-notification/', notification._id)}>
                      <i className="icon-fw icon-note"></i> {t('Edit')}
                    </a>
                    <a className="dropdown-item" onClick={() => this.openConfirmationModal(notification)}>
                      <i className="icon-fw icon-fire text-danger"></i> {t('Delete')}
                    </a>
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
        {this.state.notificationForConfiguration != null && (
          <NotificationDeleteModal
            isOpen={this.state.isConfirmationModalOpen}
            onClose={this.closeConfirmationModal}
            onClickSubmit={this.onClickSubmit}
            notificationForConfiguration={this.state.notificationForConfiguration}
          />
        )}
      </React.Fragment>
    );

  }

}

const GlobalNotificationListWrapper = (props) => {
  return createSubscribedElement(GlobalNotificationList, props, [AppContainer, AdminNotificationContainer]);
};

GlobalNotificationList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(GlobalNotificationListWrapper);
