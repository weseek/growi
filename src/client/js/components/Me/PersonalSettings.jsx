
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import UserSettings from './UserSettings';
import PasswordSettings from './PasswordSettings';
import ExternalAccountLinkedMe from './ExternalAccountLinkedMe';
import ApiSettings from './ApiSettings';

class PersonalSettings extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="m-t-10">
          <div className="personal-settings">
            <ul className="nav nav-tabs" role="tablist">
              <li className="nav-item">
                <a className="nav-link active" href="#user-settings" data-toggle="tab" role="tab"><i className="icon-user"></i> { t('User Information') }</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#external-accounts" data-toggle="tab" role="tab">
                  <i className="icon-share-alt mr-1"></i>
                  { t('admin:user_management.external_accounts') }
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#password-settings" data-toggle="tab" role="tab"><i className="icon-lock"></i> { t('Password Settings') }</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#apiToken" data-toggle="tab" role="tab"><i className="icon-paper-plane"></i> { t('API Settings') }</a>
              </li>
            </ul>
            <div className="tab-content p-t-10">
              <div id="user-settings" className="tab-pane active" role="tabpanel">
                <UserSettings />
              </div>
              <div id="external-accounts" className="tab-pane" role="tabpanel">
                <ExternalAccountLinkedMe />
              </div>
              <div id="password-settings" className="tab-pane" role="tabpanel">
                <PasswordSettings />
              </div>
              <div id="apiToken" className="tab-pane" role="tabpanel">
                <ApiSettings />
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

}

PersonalSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(PersonalSettings);
