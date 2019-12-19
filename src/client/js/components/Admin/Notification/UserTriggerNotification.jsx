import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

class UserTriggerNotification extends React.Component {

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
                />
                <p className="help-block">
                  Slack channel name. Without <code>#</code>.
                </p>
              </td>
              <td>
                <button type="button" className="btn btn-primary" onClick={this.onClickSubmit}>{t('Update')}</button>
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
