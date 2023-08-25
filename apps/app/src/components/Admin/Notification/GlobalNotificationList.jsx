import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import urljoin from 'url-join';

import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';
import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';

import NotificationDeleteModal from './NotificationDeleteModal';
import { NotificationTypeIcon } from './NotificationTypeIcon';


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
      await apiv3Put(`/notification-setting/global-notification/${notification._id}/enabled`, {
        isEnabled,
      });
      toastSuccess(t('notification_settings.toggle_notification', { path: notification.triggerPath }));
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
      toastSuccess(t('notification_settings.delete_notification_pattern', { path: deletedNotificaton.triggerPath }));
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
                <ul className="list-inline mb-0">
                  {notification.triggerEvents.includes('pageCreate') && (
                    <li className="list-inline-item badge rounded-pill bg-success">
                      <i className="icon-doc"></i> CREATE
                    </li>
                  )}
                  {notification.triggerEvents.includes('pageEdit') && (
                    <li className="list-inline-item badge rounded-pill bg-warning text-dark">
                      <i className="icon-pencil"></i> EDIT
                    </li>
                  )}
                  {notification.triggerEvents.includes('pageMove') && (
                    <li className="list-inline-item badge rounded-pill bg-pink">
                      <i className="icon-action-redo"></i> MOVE
                    </li>
                  )}
                  {notification.triggerEvents.includes('pageDelete') && (
                    <li className="list-inline-item badge rounded-pill bg-danger">
                      <i className="icon-fire"></i> DELETE
                    </li>
                  )}
                  {notification.triggerEvents.includes('pageLike') && (
                    <li className="list-inline-item badge rounded-pill bg-info">
                      <i className="fa fa-heart-o"></i> LIKE
                    </li>
                  )}
                  {notification.triggerEvents.includes('comment') && (
                    <li className="list-inline-item badge rounded-pill bg-primary">
                      <i className="icon-fw icon-bubble"></i> POST
                    </li>
                  )}
                </ul>
              </td>
              <td>
                <NotificationTypeIcon notification={notification} />
                { notification.__t === 'mail' && notification.toEmail }
                { notification.__t === 'slack' && notification.slackChannels }
              </td>
              <td className="td-abs-center">
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <i className="icon-settings"></i> <span className="caret"></span>
                  </button>
                  <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                    <a className="dropdown-item" href={urljoin('/admin/global-notification/', notification._id)}>
                      <i className="icon-fw icon-note"></i> {t('Edit')}
                    </a>
                    <button className="dropdown-item" type="button" onClick={() => this.openConfirmationModal(notification)}>
                      <i className="icon-fw icon-fire text-danger"></i> {t('Delete')}
                    </button>
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

GlobalNotificationList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

const GlobalNotificationListWrapperFC = (props) => {
  const { t } = useTranslation('admin');

  return <GlobalNotificationList t={t} {...props} />;
};

const GlobalNotificationListWrapper = withUnstatedContainers(GlobalNotificationListWrapperFC, [AdminNotificationContainer]);

export default GlobalNotificationListWrapper;
