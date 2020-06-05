import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import MikanSecuritySetting from './MikanSecuritySetting';
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

  constructor() {
    super();

    this.state = {
      activeTab: 'passport-local',
      // Prevent unnecessary rendering
      activeComponents: new Set(['passport-local']),
    };

    this.toggleActiveTab = this.toggleActiveTab.bind(this);
  }

  toggleActiveTab(activeTab) {
    this.setState({
      activeTab, activeComponents: this.state.activeComponents.add(activeTab),
    });
  }

  render() {
    const { t } = this.props;
    const { activeTab, activeComponents } = this.state;
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

        <div className="auth-mechanism-configurations">
          <h2 className="border-bottom">{t('security_setting.Authentication mechanism settings')}</h2>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-local' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-local') }}
                href="#passport-local"
              >
                <i className="fa fa-users" /> ID/Pass
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-mikan' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-mikan') }}
                href="#passport-mikan"
              >
                <i className="fa fa-paper-plane" /> Mikan
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-ldap' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-ldap') }}
                href="#passport-ldap"
              >
                <i className="fa fa-sitemap" /> LDAP
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-saml' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-saml') }}
                href="#passport-saml"
              >
                <i className="fa fa-key" /> SAML
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-oidc' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-oidc') }}
                href="#passport-oidc"
              >
                <i className="fa fa-openid" /> OIDC
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-basic' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-basic') }}
                href="#passport-basic"
              >
                <i className="fa fa-lock" /> BASIC
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-google' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-google') }}
                href="#passport-google"
              >
                <i className="fa fa-google" /> Google
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-github' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-github') }}
                href="#passport-github"
              >
                <i className="fa fa-github" /> GitHub
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-twitter' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-twitter') }}
                href="#passport-twitter"
              >
                <i className="fa fa-twitter" /> Twitter
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`${activeTab === 'passport-facebook' && 'active'} `}
                onClick={() => { this.toggleActiveTab('passport-facebook') }}
                href="#passport-facebook"
              >
                <i className="fa fa-facebook" /> (TBD) Facebook
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab} className="mt-2">
            <TabPane tabId="passport-local">
              {activeComponents.has('passport-local') && <LocalSecuritySetting />}
            </TabPane>
            <TabPane tabId="passport-mikan">
              {activeComponents.has('passport-mikan') && <MikanSecuritySetting />}
            </TabPane>
            <TabPane tabId="passport-ldap">
              {activeComponents.has('passport-ldap') && <LdapSecuritySetting />}
            </TabPane>
            <TabPane tabId="passport-saml">
              {activeComponents.has('passport-saml') && <SamlSecuritySetting />}
            </TabPane>
            <TabPane tabId="passport-oidc">
              {activeComponents.has('passport-oidc') && <OidcSecuritySetting />}
            </TabPane>
            <TabPane tabId="passport-basic">
              {activeComponents.has('passport-basic') && <BasicSecuritySetting />}
            </TabPane>
            <TabPane tabId="passport-google">
              {activeComponents.has('passport-google') && <GoogleSecuritySetting />}
            </TabPane>
            <TabPane tabId="passport-github">
              {activeComponents.has('passport-github') && <GitHubSecuritySetting />}
            </TabPane>
            <TabPane tabId="passport-twitter">
              {activeComponents.has('passport-twitter') && <TwitterSecuritySetting />}
            </TabPane>
            <TabPane tabId="passport-facebook">
              {activeComponents.has('passport-facebook') && <FacebookSecuritySetting />}
            </TabPane>
          </TabContent>
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
