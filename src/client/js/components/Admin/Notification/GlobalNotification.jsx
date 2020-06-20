import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';
import GlobalNotificationList from './GlobalNotificationList';

const logger = loggerFactory('growi:GlobalNotification');

class GlobalNotification extends React.Component {

  constructor() {
    super();

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminNotificationContainer } = this.props;

    try {
      await adminNotificationContainer.updateGlobalNotificationForPages();
      toastSuccess(t('toaster.update_successed', { target: t('Notification Settings') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminNotificationContainer } = this.props;
    const { globalNotifications } = adminNotificationContainer.state;
    return (
      <React.Fragment>

        <h2 className="border-bottom my-4">{t('notification_setting.valid_page')}</h2>

        <p className="card well">
          {/* eslint-disable-next-line react/no-danger */}
          <span dangerouslySetInnerHTML={{ __html: t('notification_setting.link_notification_help') }} />
        </p>


        <div className="row mb-4">
          <div className="col-md-8 offset-md-2">
            <div className="custom-control custom-checkbox custom-checkbox-success">
              <input
                id="isNotificationForOwnerPageEnabled"
                className="custom-control-input"
                type="checkbox"
                checked={adminNotificationContainer.state.isNotificationForOwnerPageEnabled || false}
                onChange={() => { adminNotificationContainer.switchIsNotificationForOwnerPageEnabled() }}
              />
              <label className="custom-control-label" htmlFor="isNotificationForOwnerPageEnabled">
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{ __html: t('notification_setting.just_me_notification_help') }} />
              </label>
            </div>
          </div>
        </div>


        <div className="row mb-4">
          <div className="col-md-8 offset-md-2">
            <div className="custom-control custom-checkbox custom-checkbox-success">
              <input
                id="isNotificationForGroupPageEnabled"
                className="custom-control-input"
                type="checkbox"
                checked={adminNotificationContainer.state.isNotificationForGroupPageEnabled || false}
                onChange={() => { adminNotificationContainer.switchIsNotificationForGroupPageEnabled() }}
              />
              <label className="custom-control-label" htmlFor="isNotificationForGroupPageEnabled">
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{ __html: t('notification_setting.group_notification_help') }} />
              </label>
            </div>
          </div>
        </div>

        <div className="row my-3">
          <div className="col-sm-5 offset-sm-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onClickSubmit}
              disabled={adminNotificationContainer.state.retrieveError}
            >{t('Update')}
            </button>
          </div>
        </div>

        <h2 className="border-bottom mb-5">{t('notification_setting.notification_list')}
          <a href="/admin/global-notification/new">
            <p className="btn btn-outline-secondary pull-right">{t('notification_setting.add_notification')}</p>
          </a>
        </h2>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ON/OFF</th>
              {/* eslint-disable-next-line react/no-danger */}
              <th>{t('notification_setting.trigger_path')} <span dangerouslySetInnerHTML={{ __html: t('notification_setting.trigger_path_help') }} /></th>
              <th>{t('notification_setting.trigger_events')}</th>
              <th>{t('notification_setting.notify_to')}</th>
              <th></th>
            </tr>
          </thead>
          {globalNotifications.length !== 0 && (
            <tbody className="admin-notif-list">
              <GlobalNotificationList />
            </tbody>
          )}
        </table>

      </React.Fragment>
    );
  }

}

const GlobalNotificationWrapper = withUnstatedContainers(GlobalNotification, [AppContainer, AdminNotificationContainer]);

GlobalNotification.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(GlobalNotificationWrapper);
