import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import urljoin from 'url-join';

const AdminNavigation = (props) => {
  const { t } = props;
  const pathname = window.location.pathname;

  const isActiveMenu = (path) => {
    return (pathname.startsWith(urljoin('/admin', path)));
  };

  return (
    <div className="list-group admin-navigation">
      <a href="/admin" className={`list-group-item list-group-item-action ${pathname === '/admin' && 'active'}`}>
        <i className="icon-fw icon-home"></i> {t('Management Wiki Home')}
      </a>
      <a href="/admin/app" className={`list-group-item list-group-item-action ${isActiveMenu('/app') && 'active'}`}>
        <i className="icon-fw icon-settings"></i> {t('App Settings')}
      </a>
      <a href="/admin/security" className={`list-group-item list-group-item-action ${isActiveMenu('/security') && 'active'}`}>
        <i className="icon-fw icon-shield"></i> {t('security_settings')}
      </a>
      <a href="/admin/markdown" className={`list-group-item list-group-item-action ${isActiveMenu('/markdown') && 'active'}`}>
        <i className="icon-fw icon-note"></i> {t('Markdown Settings')}
      </a>
      <a href="/admin/customize" className={`list-group-item list-group-item-action ${isActiveMenu('/customize') && 'active'}`}>
        <i className="icon-fw icon-wrench"></i> {t('Customize')}
      </a>
      <a href="/admin/importer" className={`list-group-item list-group-item-action ${isActiveMenu('/importer') && 'active'}`}>
        <i className="icon-fw icon-cloud-upload"></i> {t('Import Data')}
      </a>
      <a href="/admin/export" className={`list-group-item list-group-item-action ${isActiveMenu('/export') && 'active'}`}>
        <i className="icon-fw icon-cloud-download"></i> {t('Export Archive Data')}
      </a>
      <a href="/admin/notification" className={`list-group-item list-group-item-action ${(isActiveMenu('/notification') || isActiveMenu('/global-notification')) && 'active'}`}>
        <i className="icon-fw icon-bell"></i> {t('Notification Settings')}
      </a>
      <a href="/admin/users" className={`list-group-item list-group-item-action ${(isActiveMenu('/users')) && 'active'}`}>
        <i className="icon-fw icon-user"></i> {t('User_Management')}
      </a>
      <a href="/admin/user-groups" className={`list-group-item list-group-item-action ${isActiveMenu('/user-group') && 'active'}`}>
        <i className="icon-fw icon-people"></i> {t('UserGroup Management')}
      </a>
      <a href="/admin/search" className={`list-group-item list-group-item-action ${isActiveMenu('/search') && 'active'}`}>
        <i className="icon-fw icon-magnifier"></i> {t('Full Text Search Management')}
      </a>
    </div>
  );
};


AdminNavigation.propTypes = {
  t: PropTypes.func.isRequired, // i18next

};

export default withTranslation()(AdminNavigation);
