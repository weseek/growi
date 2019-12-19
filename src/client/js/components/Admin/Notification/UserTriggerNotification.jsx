import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

const logger = loggerFactory('growi:slackAppConfiguration');

class UserTriggerNotification extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pathPattern: '',
      channel: '',
    };

    this.changePathPattern = this.changePathPattern.bind(this);
    this.changeChannel = this.changeChannel.bind(this);
    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  /**
   * Change pathPattern
   */
  changePathPattern(pathPattern) {
    this.setState({ pathPattern });
  }

  /**
   * Change channel
   */
  changeChannel(channel) {
    this.setState({ channel });
  }

  async onClickSubmit() {
    const { t, adminNotificationContainer } = this.props;

    try {
      // await adminNotificationContainer.updateSlackAppConfiguration();
      toastSuccess(t('notification_setting.add_notification_pattern'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  // TODO GW-788 i18n
  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <h2 className="border-bottom mb-5">Default Notification Settings for Patterns</h2>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Channel</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody className="admin-notif-list">
            <tr>
              <td>
                <input
                  className="form-control"
                  type="text"
                  name="pathPattern"
                  defaultValue=""
                  placeholder="e.g. /projects/xxx/MTG/*"
                  onChange={(e) => { this.changePathPattern(e.target.value) }}
                />
                <p className="help-block">
                  Path name of wiki. Pattern expression with <code>*</code> can be used.
                </p>
              </td>
              <td>
                <input
                  className="form-control form-inline"
                  type="text"
                  name="channel"
                  defaultValue=""
                  placeholder="e.g. project-xxx"
                  onChange={(e) => { this.changeChannel(e.target.value) }}
                />
                <p className="help-block">
                  Slack channel name. Without <code>#</code>.
                </p>
              </td>
              <td>
                <button type="button" className="btn btn-primary" onClick={this.onClickSubmit}>{t('add')}</button>
              </td>
            </tr>
          </tbody>
        </table>
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
