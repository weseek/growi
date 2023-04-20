import React, { useMemo, useState } from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import TabContent from 'reactstrap/es/TabContent';
import TabPane from 'reactstrap/es/TabPane';

import CustomNav from '../../CustomNavigation/CustomNav';

// import FacebookSecuritySetting from './FacebookSecuritySetting';
import GitHubSecuritySetting from './GitHubSecuritySetting';
import GoogleSecuritySetting from './GoogleSecuritySetting';
import LdapSecuritySetting from './LdapSecuritySetting';
import LocalSecuritySetting from './LocalSecuritySetting';
import OidcSecuritySetting from './OidcSecuritySetting';
import SamlSecuritySetting from './SamlSecuritySetting';
import SecuritySetting from './SecuritySetting';
import ShareLinkSetting from './ShareLinkSetting';

const SecurityManagementContents = () => {
  const { t } = useTranslation('admin');

  const [activeTab, setActiveTab] = useState('passport_local');
  const [activeComponents, setActiveComponents] = useState(new Set(['passport_local']));

  const switchActiveTab = (selectedTab) => {
    setActiveTab(selectedTab);
    setActiveComponents(activeComponents.add(selectedTab));
  };

  const navTabMapping = useMemo(() => {
    return {
      passport_local: {
        Icon: () => <i className="fa fa-users" />,
        i18n: 'ID/Pass',
      },
      passport_ldap: {
        Icon: () => <i className="fa fa-sitemap" />,
        i18n: 'LDAP',
      },
      passport_saml: {
        Icon: () => <i className="fa fa-key" />,
        i18n: 'SAML',
      },
      passport_oidc: {
        Icon: () => <i className="fa fa-key" />,
        i18n: 'OIDC',
      },
      passport_google: {
        Icon: () => <i className="fa fa-google" />,
        i18n: 'Google',
      },
      passport_github: {
        Icon: () => <i className="fa fa-github" />,
        i18n: 'GitHub',
      },
      // passport_facebook: {
      //   Icon: () => <i className="fa fa-facebook" />,
      //   i18n: '(TBD) Facebook',
      // },
    };
  }, []);


  return (
    <div data-testid="admin-security">
      <div className="mb-5">
        <SecuritySetting />
      </div>

      {/* Shared Link List */}
      <div className="mb-5">
        <ShareLinkSetting />
      </div>


      {/* XSS configuration link */}
      <div className="mb-5">
        <h2 className="border-bottom">{t('security_settings.xss_prevent_setting')}</h2>
        <div className="text-center">
          <Link
            href="/admin/markdown/#preventXSS"
            style={{ fontSize: 'large' }}
          >
            <i className="fa-fw icon-login"></i> {t('security_settings.xss_prevent_setting_link')}
          </Link>
        </div>
      </div>

      <div className="auth-mechanism-configurations">
        <h2 className="border-bottom">{t('security_settings.Authentication mechanism settings')}</h2>
        <CustomNav
          activeTab={activeTab}
          navTabMapping={navTabMapping}
          onNavSelected={switchActiveTab}
          hideBorderBottom
          breakpointToSwitchDropdownDown="md"
        />
        <TabContent activeTab={activeTab} className="p-5">
          <TabPane tabId="passport_local">
            {activeComponents.has('passport_local') && <LocalSecuritySetting />}
          </TabPane>
          <TabPane tabId="passport_ldap">
            {activeComponents.has('passport_ldap') && <LdapSecuritySetting />}
          </TabPane>
          <TabPane tabId="passport_saml">
            {activeComponents.has('passport_saml') && <SamlSecuritySetting />}
          </TabPane>
          <TabPane tabId="passport_oidc">
            {activeComponents.has('passport_oidc') && <OidcSecuritySetting />}
          </TabPane>
          <TabPane tabId="passport_google">
            {activeComponents.has('passport_google') && <GoogleSecuritySetting />}
          </TabPane>
          <TabPane tabId="passport_github">
            {activeComponents.has('passport_github') && <GitHubSecuritySetting />}
          </TabPane>
          {/* <TabPane tabId="passport_facebook">
            {activeComponents.has('passport_facebook') && <FacebookSecuritySetting />}
          </TabPane> */}
        </TabContent>
      </div>
    </div>
  );

};

export default SecurityManagementContents;
