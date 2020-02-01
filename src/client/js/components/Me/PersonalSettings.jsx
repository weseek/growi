
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import UserSettings from './UserSettings';
import ExternalAccountLinkedMe from './ExternalAccountLinkedMe';

class PersonalSettings extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        {/* TODO GW-226 adapt BS4 */}
        <div className="m-t-10">
          <div className="personal-settings">
            <ul className="nav nav-tabs" role="tablist">
              <li className="active">
                <a href="#user-settings" data-toggle="tab" role="tab"><i className="icon-user"></i> { t('User Information') }</a>
              </li>
              <li>
                <a href="#external-accounts" data-toggle="tab" role="tab"><i className="icon-share-alt"></i> { t('External Accounts') }</a>
              </li>
              <li>
                <a href="#password-settings" data-toggle="tab" role="tab"><i className="icon-lock"></i> { t('Password Settings') }</a>
              </li>
              <li>
                <a href="#apiToken" data-toggle="tab" role="tab"><i className="icon-paper-plane"></i> { t('API Settings') }</a>
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
                {/* TODO GW-1030 create component */}
              </div>
              <div id="apiToken" className="tab-pane" role="tabpanel">
                {/* TODO GW-1031 create component */}
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
