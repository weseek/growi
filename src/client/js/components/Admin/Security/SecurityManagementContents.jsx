import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

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
import ShareLinkSetting from './ShareLinkSetting';

import CustomNavigation from '../../CustomNavigation';

function SecurityManagementContents(props) {
  const { t } = props;

  const navTabMapping = useMemo(() => {
    return {
      passport_local: {
        Icon: () => <i className="fa fa-users" />,
        Content: LocalSecuritySetting,
        i18n: 'ID/Pass',
        index: 0,
      },
      passport_ldap: {
        Icon: () => <i className="fa fa-sitemap" />,
        Content: LdapSecuritySetting,
        i18n: 'LDAP',
        index: 1,
      },
      passport_saml: {
        Icon: () => <i className="fa fa-key" />,
        Content: SamlSecuritySetting,
        i18n: 'SAML',
        index: 2,
      },
      passport_oidc: {
        Icon: () => <i className="fa fa-key" />,
        Content: OidcSecuritySetting,
        i18n: 'OIDC',
        index: 3,
      },
      passport_basic: {
        Icon: () => <i className="fa fa-lock" />,
        Content: BasicSecuritySetting,
        i18n: 'BASIC',
        index: 4,
      },
      passport_google: {
        Icon: () => <i className="fa fa-google" />,
        Content: GoogleSecuritySetting,
        i18n: 'Google',
        index: 5,
      },
      passport_github: {
        Icon: () => <i className="fa fa-github" />,
        Content: GitHubSecuritySetting,
        i18n: 'GitHub',
        index: 6,
      },
      passport_twitter: {
        Icon: () => <i className="fa fa-twitter" />,
        Content: TwitterSecuritySetting,
        i18n: 'Twitter',
        index: 7,
      },
      passport_facebook: {
        Icon: () => <i className="fa fa-facebook" />,
        Content: FacebookSecuritySetting,
        i18n: '(TBD) Facebook',
        index: 8,
      },
    };
  }, []);


  return (
    <Fragment>
      <div className="mb-5">
        <SecuritySetting />
      </div>

      {/* Shared Link List */}
      <div className="mb-5">
        <ShareLinkSetting />
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
        <CustomNavigation navTabMapping={navTabMapping} />
      </div>
    </Fragment>
  );

}

SecurityManagementContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(SecurityManagementContents);
