/* eslint-disable no-multi-spaces */
/* eslint-disable react/jsx-props-no-multi-spaces */

import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import urljoin from 'url-join';

import { pathUtils } from '@growi/core';

import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';

const AdminNavigation = (props) => {
  const { t, appContainer } = props;
  const pathname = window.location.pathname;

  const growiCloudUri = appContainer.config.env.GROWI_CLOUD_URI;
  const growiAppIdForGrowiCloud = appContainer.config.env.GROWI_APP_ID_FOR_GROWI_CLOUD;

  // eslint-disable-next-line react/prop-types
  const MenuLabel = ({ menu }) => {
    switch (menu) {
      case 'app':                      return <><i className="icon-fw icon-settings"></i>        { t('App Settings') }</>;
      case 'security':                 return <><i className="icon-fw icon-shield"></i>          { t('security_settings') }</>;
      case 'markdown':                 return <><i className="icon-fw icon-note"></i>            { t('Markdown Settings') }</>;
      case 'customize':                return <><i className="icon-fw icon-wrench"></i>          { t('Customize') }</>;
      case 'importer':                 return <><i className="icon-fw icon-cloud-upload"></i>    { t('Import Data') }</>;
      case 'export':                   return <><i className="icon-fw icon-cloud-download"></i>  { t('Export Archive Data') }</>;
      case 'notification':             return <><i className="icon-fw icon-bell"></i>            { t('External_Notification')}</>;
      case 'slack-integration':        return <><i className="icon-fw icon-shuffle"></i>         { t('slack_integration') }</>;
      case 'slack-integration-legacy': return <><i className="icon-fw icon-shuffle"></i>         { t('Legacy_Slack_Integration')}</>;
      case 'users':                    return <><i className="icon-fw icon-user"></i>            { t('User_Management') }</>;
      case 'user-groups':              return <><i className="icon-fw icon-people"></i>          { t('UserGroup Management') }</>;
      case 'search':                   return <><i className="icon-fw icon-magnifier"></i>       { t('Full Text Search Management') }</>;
      case 'cloud':                    return <><i className="icon-fw icon-share-alt"></i>       { t('to_cloud_settings')} </>;
      default:                         return <><i className="icon-fw icon-home"></i>            { t('Wiki Management Home Page') }</>;
    }
  };

  const MenuLink = ({
    // eslint-disable-next-line react/prop-types
    menu, isRoot, isListGroupItems, isActive,
  }) => {
    const pageTransitionClassName = isListGroupItems
      ? 'list-group-item list-group-item-action border-0 round-corner'
      : 'dropdown-item px-3 py-2';

    return (
      <a
        href={isRoot ? '/admin' : urljoin('/admin', menu)}
        className={`${pageTransitionClassName} ${isActive ? 'active' : ''}`}
      >
        <MenuLabel menu={menu} />
      </a>
    );
  };

  const isActiveMenu = (path) => {
    const basisPath = pathUtils.normalizePath(urljoin('/admin', path));
    const basisParentPath = pathUtils.addTrailingSlash(basisPath);

    return (
      pathname === basisPath
      || pathname.startsWith(basisParentPath)
    );
  };

  const getListGroupItemOrDropdownItemList = (isListGroupItems) => {
    return (
      <>
        <MenuLink menu="home"         isListGroupItems isActive={pathname === '/admin'} isRoot />
        <MenuLink menu="app"          isListGroupItems isActive={isActiveMenu('/app')} />
        <MenuLink menu="security"     isListGroupItems isActive={isActiveMenu('/security')} />
        <MenuLink menu="markdown"     isListGroupItems isActive={isActiveMenu('/markdown')} />
        <MenuLink menu="customize"    isListGroupItems isActive={isActiveMenu('/customize')} />
        <MenuLink menu="importer"     isListGroupItems isActive={isActiveMenu('/importer')} />
        <MenuLink menu="export"       isListGroupItems isActive={isActiveMenu('/export')} />
        <MenuLink menu="notification" isListGroupItems isActive={isActiveMenu('/notification') || isActiveMenu('/global-notification')} />
        <MenuLink menu="slack-integration" isListGroupItems isActive={isActiveMenu('/slack-integration')} />
        <MenuLink menu="slack-integration-legacy" isListGroupItems isActive={isActiveMenu('/slack-integration-legacy')} />
        <MenuLink menu="users"        isListGroupItems isActive={isActiveMenu('/users')} />
        <MenuLink menu="user-groups"  isListGroupItems isActive={isActiveMenu('/user-groups')} />
        <MenuLink menu="search"       isListGroupItems isActive={isActiveMenu('/search')} />
        {growiCloudUri != null && growiAppIdForGrowiCloud != null
          && (
            <a
              href={`${growiCloudUri}/my/apps/${growiAppIdForGrowiCloud}`}
              className="list-group-item list-group-item-action border-0 round-corner"
            >
              <MenuLabel menu="cloud" />
            </a>
          )
        }
      </>
    );
  };

  return (
    <React.Fragment>
      {/* List group */}
      <div className="list-group admin-navigation sticky-top d-none d-lg-block">
        {getListGroupItemOrDropdownItemList(true)}
      </div>

      {/* Dropdown */}
      <div className="dropdown d-block d-lg-none mb-5">
        <button
          className="btn btn-outline-primary btn-lg dropdown-toggle col-12 text-right"
          type="button"
          id="dropdown-admin-navigation"
          data-display="static"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span className="float-left">
            {pathname === '/admin' &&              <MenuLabel menu="home" />}
            {isActiveMenu('/app') &&               <MenuLabel menu="app" />}
            {isActiveMenu('/security') &&          <MenuLabel menu="security" />}
            {isActiveMenu('/markdown') &&          <MenuLabel menu="markdown" />}
            {isActiveMenu('/customize') &&         <MenuLabel menu="customize" />}
            {isActiveMenu('/importer') &&          <MenuLabel menu="importer" />}
            {isActiveMenu('/export') &&            <MenuLabel menu="export" />}
            {(isActiveMenu('/notification') || isActiveMenu('/global-notification')) && <MenuLabel menu="notification" />}
            {isActiveMenu('/slack-integration') && <MenuLabel menu="slack-integration" />}
            {isActiveMenu('/users') &&             <MenuLabel menu="users" />}
            {isActiveMenu('/user-groups') &&       <MenuLabel menu="user-groups" />}
            {isActiveMenu('/search') &&            <MenuLabel menu="search" />}
          </span>
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdown-admin-navigation">
          {getListGroupItemOrDropdownItemList(false)}
        </div>
      </div>

    </React.Fragment>
  );
};

const AdminNavigationWrapper = withUnstatedContainers(AdminNavigation, [AppContainer]);

AdminNavigation.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(AdminNavigationWrapper);
