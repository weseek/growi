import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const AdminNavigation = (props) => {
  const { t } = props;

  const pathname = window.location.pathname;
  const activeMenu = pathname.split('/')[2];

  return (
    <ul className="nav nav-pills nav-stacked">
      <li className={`${activeMenu === 'index' && 'active'}`}>
        <a href="/admin"><i className="icon-fw icon-home"></i> { t('Management Wiki Home') }</a>
      </li>
      <li className={`${activeMenu === 'app' && 'active'}`}>
        <a href="/admin/app"><i className="icon-fw icon-settings"></i> { t('App Settings') }</a>
      </li>
      <li className={`${activeMenu === 'security' && 'active'}`}>
        <a href="/admin/security"><i className="icon-fw icon-shield"></i> { t('security_settings') }</a>
      </li>
      <li className={`${activeMenu === 'markdown' && 'active'}`}>
        <a href="/admin/markdown"><i className="icon-fw icon-note"></i> { t('Markdown Settings') }</a>
      </li>
      <li className={`${activeMenu === 'customize' && 'active'}`}>
        <a href="/admin/customize"><i className="icon-fw icon-wrench"></i> { t('Customize') }</a>
      </li>
      <li className={`${activeMenu === 'importer' && 'active'}`}>
        <a href="/admin/importer"><i className="icon-fw icon-cloud-upload"></i> { t('Import Data') }</a>
      </li>
      <li className={`${activeMenu === 'export' && 'active'}`}>
        <a href="/admin/export"><i className="icon-fw icon-cloud-download"></i> { t('Export Archive Data') }</a>
      </li>
      <li className={`${activeMenu === 'notification' && 'active'}`}>
        <a href="/admin/notification"><i className="icon-fw icon-bell"></i> { t('Notification Settings') }</a>
      </li>
      <li className={`${(activeMenu === 'user' || activeMenu === 'externalaccount') && 'active'}`}>
        <a href="/admin/users"><i className="icon-fw icon-user"></i> { t('User_Management') }</a>
      </li>
      <li className={`${activeMenu === 'user-group' && 'active'}`}>
        <a href="/admin/user-groups"><i className="icon-fw icon-people"></i> { t('UserGroup Management') }</a>
      </li>
      <li className={`${activeMenu === 'search' && 'active'}`}>
        <a href="/admin/search"><i className="icon-fw icon-magnifier"></i> { t('Full Text Search Management') }</a>
      </li>
    </ul>
  );
};


AdminNavigation.propTypes = {
  t: PropTypes.func.isRequired, // i18next

};

export default withTranslation()(AdminNavigation);
