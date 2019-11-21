import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminSecurityContainer from '../../../services/AdminSecurityContainer';

class SecurityLdapSetting extends React.Component {

  render() {
    const { t, adminSecurityContainer } = this.props;
    const { ldapConfig } = adminSecurityContainer.state;

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
                checked={ldapConfig.isEnabled}
                onChange={() => { adminSecurityContainer.switchIsLdapEnabled() }}
              />
              <label htmlFor="isLdapEnabled">
                { t('security_setting.ldap.enable_ldap') }
              </label>
            </div>
          </div>
        </div>


        {ldapConfig.isEnabled && (
          <React.Fragment>
            <div className="row mb-5">
              <label htmlFor="serverUrl" className="col-xs-3 control-label text-right">Server URL</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="serverUrl"
                  value={ldapConfig.serverUrl}
                />
                <small>
                  <p
                    className="help-block"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.server_url_detail') }}
                  />
                  { t('security_setting.example') }: <code>ldaps://ldap.company.com/ou=people,dc=company,dc=com</code>
                </small>
              </div>
            </div>

            <div className="row mb-5">
              <strong className="col-xs-3 text-right">{ t('security_setting.ldap.bind_mode') }</strong>
              <div className="col-xs-6 text-left">
                <div className="checkbox checkbox-success">
                  <input
                    id="isLdapEnabled"
                    type="checkbox"
                    checked={ldapConfig.isEnabled}
                    onChange={() => { adminSecurityContainer.switchIsLdapEnabled() }}
                  />
                  <label htmlFor="isLdapEnabled">
                    { t('security_setting.ldap.enable_ldap') }
                  </label>
                </div>
              </div>
            </div>

          </React.Fragment>
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
