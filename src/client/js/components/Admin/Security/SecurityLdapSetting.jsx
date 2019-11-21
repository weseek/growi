import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminSecurityContainer from '../../../services/AdminSecurityContainer';

class SecurityLdapSetting extends React.Component {

  render() {
    const { t, adminSecurityContainer } = this.props;

    return (
      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          LDAP { t('security_setting.configuration') }
        </h2>

        <div className="row mb-5">
          <strong className="col-xs-3 text-right">Use LDAP</strong>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isLdapEnabled"
                type="checkbox"
                checked={adminSecurityContainer.state.isLdapEnabled}
                onChange={() => { adminSecurityContainer.switchIsLdapEnabled() }}
              />
              <label htmlFor="isLdapEnabled">
                { t('security_setting.ldap.enable_ldap') }
              </label>
            </div>
          </div>
        </div>


        {adminSecurityContainer.state.isLdapEnabled && (
        <p>hoge</p>
        )}

      </React.Fragment>
    );
  }

}

SecurityLdapSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminSecurityContainer: PropTypes.instanceOf(AdminSecurityContainer).isRequired,
};

const SecurityLdapSettingWrapper = (props) => {
  return createSubscribedElement(SecurityLdapSetting, props, [AppContainer, AdminSecurityContainer]);
};

export default withTranslation()(SecurityLdapSettingWrapper);
