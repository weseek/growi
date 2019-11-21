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
                  onChange={e => adminSecurityContainer.changeServerUrl(e.target.value)}
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
                <div className="my-0 btn-group">
                  <div className="dropdown">
                    <button className="btn btn-default dropdown-toggle w-100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <span className="pull-left">{t(`security_setting.ldap.bind_${ldapConfig.bindMode}`)}</span>
                      <span className="bs-caret pull-right">
                        <span className="caret" />
                      </span>
                    </button>
                    {/* TODO adjust dropdown after BS4 */}
                    <ul className="dropdown-menu" role="menu">
                      <li key="manager" role="presentation" type="button" onClick={() => { adminSecurityContainer.changeLdapBindMode('manager') }}>
                        <a role="menuitem">{ t('security_setting.ldap.bind_manager') }</a>
                      </li>
                      <li key="user" role="presentation" type="button" onClick={() => { adminSecurityContainer.changeLdapBindMode('user') }}>
                        <a role="menuitem">{ t('security_setting.ldap.bind_user') }</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-5">
              <strong className="col-xs-3 text-right">Bind DN</strong>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="bindDN"
                  value={ldapConfig.bindDN}
                  onChange={e => adminSecurityContainer.changeBindDN(e.target.value)}
                />
                {(ldapConfig.bindMode === 'manager') ? (
                  <p className="help-block passport-ldap-managerbind">
                    <small>
                      { t('security_setting.ldap.bind_DN_manager_detail') }<br />
                      { t('security_setting.example') }1: <code>uid=admin,dc=domain,dc=com</code><br />
                      { t('security_setting.example') }2: <code>admin@domain.com</code>
                    </small>
                  </p>
                ) : (
                  <p className="help-block passport-ldap-userbind">
                    <small>
                      { t('security_setting.ldap.bind_DN_user_detail1')}<br />
                      {/* eslint-disable-next-line react/no-danger */}
                      <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.bind_DN_user_detail2') }} /><br />
                      { t('security_setting.example') }1: <code>uid={'{{ username }}'},dc=domain,dc=com</code><br />
                      { t('security_setting.example') }2: <code>{'{{ username }}'}@domain.com</code>
                    </small>
                  </p>
                )}
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="bindDNPassword" className="col-xs-3 control-label text-right">{ t('security_setting.ldap.bind_DN_password') }</label>
              <div className="col-xs-6">
                <input
                  className="form-control passport-ldap-managerbind"
                  type="password"
                  name="bindDNPassword"
                  value={ldapConfig.bindDNPassword}
                  onChange={e => adminSecurityContainer.changeBindDNPassword(e.target.value)}
                />
                {(ldapConfig.bindMode === 'manager') ? (
                  <p className="help-block passport-ldap-managerbind">
                    <small>
                      { t('security_setting.ldap.bind_DN_password_manager_detail') }
                    </small>
                  </p>
                ) : (
                  <p className="help-block passport-ldap-userbind">
                    <small>
                      { t('security_setting.ldap.bind_DN_password_user_detail') }
                    </small>
                  </p>
                )}
              </div>
            </div>

            <div className="row mb-5">
              <strong className="col-xs-3 text-right">{ t('security_setting.ldap.search_filter') }</strong>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="searchFilter"
                  value={ldapConfig.searchFilter}
                  onChange={e => adminSecurityContainer.changeSearchFilter(e.target.value)}
                />
                <p className="help-block">
                  <small>
                    { t('security_setting.ldap.search_filter_detail1') }<br />
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.search_filter_detail2') }} /><br />
                    {/* eslint-disable-next-line react/no-danger */}
                    <span dangerouslySetInnerHTML={{ __html: t('security_setting.ldap.search_filter_detail3') }} />
                  </small>
                </p>
                <p className="help-block">
                  <small>
                    { t('security_setting.example') }1 - { t('security_setting.ldap.search_filter_example1') }:
                    <code>(|(uid={'{{ username }}'})(mail={'{{ username }}'}))</code><br />
                    { t('security_setting.example') }2 - { t('security_setting.ldap.search_filter_example2') }:
                    <code>(sAMAccountName={'{{ username }}'})</code>
                  </small>
                </p>
              </div>
            </div>

            <h3 className="alert-anchor border-bottom">
              Attribute Mapping ({ t('security_setting.optional') })
            </h3>

            {/* GW-617 create form */}

            <h3 className="alert-anchor border-bottom">
              { t('security_setting.ldap.group_search_filter') } ({ t('security_setting.optional') })
            </h3>

            {/* GW-617 create form */}

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
