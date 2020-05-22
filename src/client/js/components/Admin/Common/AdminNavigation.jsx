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

  const getListGroupItemOrDropdownItemList = (isListGroupItems) => {
    const pageTransitionClassName = isListGroupItems ? 'list-group-item list-group-item-action border-0 round-corner' : 'dropdown-item';
    return (
      <>
        <a
          href="/admin"
          className={`${pageTransitionClassName} ${pathname === '/admin' && 'active'}`}
        >
          <i className="icon-fw icon-home"></i> {t('Wiki_Management_Home_Page')}
        </a>
        <a
          href="/admin/app"
          className={`${pageTransitionClassName} ${isActiveMenu('/app') && 'active'}`}
        >
          <i className="icon-fw icon-settings"></i> {t('App_Settings')}
        </a>
        <a
          href="/admin/security"
          className={`${pageTransitionClassName} ${isActiveMenu('/security') && 'active'}`}
        >
          <i className="icon-fw icon-shield"></i> {t('Security_Settings')}
        </a>
        <a
          href="/admin/markdown"
          className={`${pageTransitionClassName} ${isActiveMenu('/markdown') && 'active'}`}
        >
          <i className="icon-fw icon-note"></i> {t('Markdown_Settings')}
        </a>
        <a
          href="/admin/customize"
          className={`${pageTransitionClassName} ${isActiveMenu('/customize') && 'active'}`}
        >
          <i className="icon-fw icon-wrench"></i> {t('Customize')}
        </a>
        <a
          href="/admin/importer"
          className={`${pageTransitionClassName} ${isActiveMenu('/importer') && 'active'}`}
        >
          <i className="icon-fw icon-cloud-upload"></i> {t('Import_Data')}
        </a>
        <a
          href="/admin/export"
          className={`${pageTransitionClassName} ${isActiveMenu('/export') && 'active'}`}
        >
          <i className="icon-fw icon-cloud-download"></i> {t('Export_Archive_Data')}
        </a>
        <a
          href="/admin/notification"
          className={`${pageTransitionClassName} ${(isActiveMenu('/notification') || isActiveMenu('/global-notification')) && 'active'}`}
        >
          <i className="icon-fw icon-bell"></i> {t('Notification_Settings')}
        </a>
        <a
          href="/admin/users"
          className={`${pageTransitionClassName} ${(isActiveMenu('/users')) && 'active'}`}
        >
          <i className="icon-fw icon-user"></i> {t('User_Management')}
        </a>
        <a
          href="/admin/user-groups"
          className={`${pageTransitionClassName} ${isActiveMenu('/user-group') && 'active'}`}
        >
          <i className="icon-fw icon-people"></i> {t('UserGroup_Management')}
        </a>
        <a
          href="/admin/search"
          className={`${pageTransitionClassName} ${isActiveMenu('/search') && 'active'}`}
        >
          <i className="icon-fw icon-magnifier"></i> {t('Full_Text_Search_Management')}
        </a>
      </>
    );
  };

  return (
    <div>
      <div className="list-group admin-navigation d-none d-md-block">
        {getListGroupItemOrDropdownItemList(true)}
      </div>
      <div className="dropdown d-block d-md-none">
        <button
          className="btn btn-outline-secondary dropdown-toggle col-12 text-right"
          type="button"
          id="dropdown-admin-navigation"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span className="float-left"><i className="icon-fw icon-home"></i>
            {pathname === '/admin' && t('Wiki_Management_Home_Page')}
            {pathname === '/admin/app' && t('App_Settings')}
            {pathname === '/admin/security' && t('Security_Settings')}
            {pathname === '/admin/markdown' && t('Markdown_Settings')}
            {pathname === '/admin/customize' && t('Customize')}
            {pathname === '/admin/importer' && t('Import_Data')}
            {pathname === '/admin/export' && t('Export_Archive_Data')}
            {pathname === ('/admin/notification' || '/admin/global-notification') && t('Notification_Settings')}
            {pathname === '/admin/users' && t('User_Management')}
            {pathname === '/admin/user-groups' && t('UserGroup_Management')}
            {pathname === '/admin/search' && t('Full_Text_Search_Management')}
          </span>
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdown-admin-navigation">
          {getListGroupItemOrDropdownItemList(false)}
        </div>
      </div>
    </div>
  );
};


AdminNavigation.propTypes = {
  t: PropTypes.func.isRequired, // i18next

};

export default withTranslation()(AdminNavigation);
