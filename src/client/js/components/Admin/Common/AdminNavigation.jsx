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
    <ul className="nav nav-pills nav-stacked">
      <li className={`${pathname === '/admin' && 'active'}`}>
        <a href="/admin"><i className="icon-fw icon-home"></i> { t('Management Wiki Home') }</a>
      </li>
      <li className={`${isActiveMenu('/app') && 'active'}`}>
        <a href="/admin/app"><i className="icon-fw icon-settings"></i> { t('App Settings') }</a>
      </li>
      <li className={`${isActiveMenu('/security') && 'active'}`}>
        <a href="/admin/security"><i className="icon-fw icon-shield"></i> { t('security_settings') }</a>
      </li>
      <li className={`${isActiveMenu('/markdown') && 'active'}`}>
        <a href="/admin/markdown"><i className="icon-fw icon-note"></i> { t('Markdown Settings') }</a>
      </li>
      <li className={`${isActiveMenu('/customize') && 'active'}`}>
        <a href="/admin/customize"><i className="icon-fw icon-wrench"></i> { t('Customize') }</a>
      </li>
      <li className={`${isActiveMenu('/importer') && 'active'}`}>
        <a href="/admin/importer"><i className="icon-fw icon-cloud-upload"></i> { t('Import Data') }</a>
      </li>
      <li className={`${isActiveMenu('/export') && 'active'}`}>
        <a href="/admin/export"><i className="icon-fw icon-cloud-download"></i> { t('Export Archive Data') }</a>
      </li>
      <li className={`${(isActiveMenu('/notification') || isActiveMenu('/global-notification')) && 'active'}`}>
        <a href="/admin/notification"><i className="icon-fw icon-bell"></i> { t('Notification Settings') }</a>
      </li>
      <li className={`${(isActiveMenu('/users')) && 'active'}`}>
        <a href="/admin/users"><i className="icon-fw icon-user"></i> { t('User_Management') }</a>
      </li>
      <li className={`${isActiveMenu('/user-group') && 'active'}`}>
        <a href="/admin/user-groups"><i className="icon-fw icon-people"></i> { t('UserGroup Management') }</a>
      </li>
      <li className={`${isActiveMenu('/search') && 'active'}`}>
        <a href="/admin/search"><i className="icon-fw icon-magnifier"></i> { t('Full Text Search Management') }</a>
      </li>
    </ul>
  );
};


AdminNavigation.propTypes = {
  t: PropTypes.func.isRequired, // i18next

};

export default withTranslation()(AdminNavigation);
