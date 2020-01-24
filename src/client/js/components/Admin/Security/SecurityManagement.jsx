import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import LdapSecuritySetting from './LdapSecuritySetting';
import LocalSecuritySetting from './LocalSecuritySetting';
import SamlSecuritySetting from './SamlSecuritySetting';
import OidcSecuritySetting from './OidcSecuritySetting';
import SecuritySetting from './SecuritySetting';
import BasicSecuritySetting from './BasicSecuritySetting';
import GoogleSecuritySetting from './GoogleSecuritySetting';
import GitHubSecuritySetting from './GitHubSecuritySetting';
import TwitterSecuritySetting from './TwitterSecuritySetting';
import FacebookSecuritySetting from './FacebookSecuritySetting';

class SecurityManagement extends React.Component {

  constructor(props) {
    super();

  }

  render() {
    const { t } = this.props;
    return (
      <Fragment>
        <div>
          <SecuritySetting />
        </div>

        {/* XSS configuration link */}
        <div className="mb-5">
          <h2 className="border-bottom">{t('security_setting.xss_prevent_setting')}</h2>
          <div className="text-center">
            <a style={{ fontSize: 'large' }} href="/admin/markdown/#preventXSS">
              <i className="fa-fw icon-login"></i> {t('security_setting.xss_prevent_setting_link')}
            </a>
          </div>
        </div>

        {/* TODO GW-226 adapt BS4 */}
        <div className="auth-mechanism-configurations m-t-10">
          <h2 className="border-bottom">{t('security_setting.Authentication mechanism settings')}</h2>
          <div className="passport-settings">
            <ul className="nav nav-tabs" role="tablist">
              <li className="active">
                <a href="#passport-local" data-toggle="tab" role="tab"><i className="fa fa-users"></i> ID/Pass</a>
              </li>
              <li>
                <a href="#passport-ldap" data-toggle="tab" role="tab"><i className="fa fa-sitemap"></i> LDAP</a>
              </li>
              <li>
                <a href="#passport-saml" data-toggle="tab" role="tab"><i className="fa fa-key"></i> SAML</a>
              </li>
              <li>
                <a href="#passport-oidc" data-toggle="tab" role="tab"><i className="fa fa-openid"></i> OIDC</a>
              </li>
              <li>
                <a href="#passport-basic" data-toggle="tab" role="tab"><i className="fa fa-lock"></i> Basic</a>
              </li>
              <li>
                <a href="#passport-google-oauth" data-toggle="tab" role="tab"><i className="fa fa-google"></i> Google</a>
              </li>
              <li>
                <a href="#passport-github" data-toggle="tab" role="tab"><i className="fa fa-github"></i> GitHub</a>
              </li>
              <li>
                <a href="#passport-twitter" data-toggle="tab" role="tab"><i className="fa fa-twitter"></i> Twitter</a>
              </li>
              <li className="tbd">
                <a href="#passport-facebook" data-toggle="tab" role="tab"><i className="fa fa-facebook"></i> (TBD) Facebook</a>
              </li>
            </ul>
            <div className="tab-content p-t-10">
              <div id="passport-local" className="tab-pane active" role="tabpanel">
                <LocalSecuritySetting />
              </div>
              <div id="passport-ldap" className="tab-pane" role="tabpanel">
                <LdapSecuritySetting />
              </div>
              <div id="passport-saml" className="tab-pane" role="tabpanel">
                <SamlSecuritySetting />
              </div>
              <div id="passport-oidc" className="tab-pane" role="tabpanel">
                <OidcSecuritySetting />
              </div>
              <div id="passport-basic" className="tab-pane" role="tabpanel">
                <BasicSecuritySetting />
              </div>
              <div id="passport-google-oauth" className="tab-pane" role="tabpanel">
                <GoogleSecuritySetting />
              </div>
              <div id="passport-github" className="tab-pane" role="tabpanel">
                <GitHubSecuritySetting />
              </div>
              <div id="passport-twitter" className="tab-pane" role="tabpanel">
                <TwitterSecuritySetting />
              </div>
              <div id="passport-facebook" className="tab-pane" role="tabpanel">
                <FacebookSecuritySetting />
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

}

SecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  csrf: PropTypes.string,
};

const SecurityManagementWrapper = (props) => {
  return createSubscribedElement(SecurityManagement, props, [AppContainer]);
};

export default withTranslation()(SecurityManagementWrapper);
