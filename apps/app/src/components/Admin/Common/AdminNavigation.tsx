import React, { useCallback } from 'react';

import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import urljoin from 'url-join';

import { useGrowiCloudUri, useGrowiAppIdForGrowiCloud } from '../../../stores/context';

// eslint-disable-next-line react/prop-types
const MenuLabel = ({ menu }: { menu: string }) => {
  const { t } = useTranslation(['admin', 'commons']);

  switch (menu) {
    /* eslint-disable no-multi-spaces, max-len */
    case 'app':                      return <><i className="mr-1 icon-fw icon-settings"></i>{        t('headers.app_settings', { ns: 'commons' }) }</>;
    case 'security':                 return <><i className="mr-1 icon-fw icon-shield"></i>{          t('security_settings.security_settings') }</>;
    case 'markdown':                 return <><i className="mr-1 icon-fw icon-note"></i>{            t('markdown_settings.markdown_settings') }</>;
    case 'customize':                return <><i className="mr-1 icon-fw icon-wrench"></i>{          t('customize_settings.customize_settings') }</>;
    case 'importer':                 return <><i className="mr-1 icon-fw icon-cloud-upload"></i>{    t('importer_management.import_data') }</>;
    case 'export':                   return <><i className="mr-1 icon-fw icon-cloud-download"></i>{  t('export_management.export_archive_data') }</>;
    case 'data-transfer':            return <><i className="mr-1 icon-fw icon-plane"></i>{           t('g2g_data_transfer.data_transfer', { ns: 'commons' })}</>;
    case 'notification':             return <><i className="mr-1 icon-fw icon-bell"></i>{            t('external_notification.external_notification')}</>;
    case 'slack-integration':        return <><i className="mr-1 icon-fw icon-shuffle"></i>{         t('slack_integration.slack_integration') }</>;
    case 'slack-integration-legacy': return <><i className="mr-1 icon-fw icon-shuffle"></i>{         t('slack_integration_legacy.slack_integration_legacy')}</>;
    case 'users':                    return <><i className="mr-1 icon-fw icon-user"></i>{            t('user_management.user_management') }</>;
    case 'user-groups':              return <><i className="mr-1 icon-fw icon-people"></i>{          t('user_group_management.user_group_management') }</>;
    case 'audit-log':                return <><i className="mr-1 icon-fw icon-feed"></i>{            t('audit_log_management.audit_log')}</>;
    case 'plugins':                  return <><i className="mr-1 icon-fw icon-puzzle"></i>{          t('plugins.plugins')}</>;
    case 'search':                   return <><i className="mr-1 icon-fw icon-magnifier"></i>{       t('full_text_search_management.full_text_search_management') }</>;
    case 'cloud':                    return <><i className="mr-1 icon-fw icon-share-alt"></i>{       t('cloud_setting_management.to_cloud_settings')} </>;
    default:                         return <><i className="mr-1 icon-fw icon-home"></i>{            t('wiki_management_home_page') }</>;
      /* eslint-enable no-multi-spaces, max-len */
  }
};

type MenuLinkProps = {
  menu: string,
  isListGroupItems: boolean,
  isRoot?: boolean,
  isActive?: boolean,
}

const MenuLink = ({
  menu, isRoot, isListGroupItems, isActive,
}: MenuLinkProps) => {

  const pageTransitionClassName = isListGroupItems
    ? 'list-group-item list-group-item-action border-0 round-corner'
    : 'dropdown-item px-3 py-2';

  const href = isRoot ? '/admin' : urljoin('/admin', menu);

  return (
    <Link
      href={href}
      className={`${pageTransitionClassName} ${isActive ? 'active' : ''}`}
    >
      <MenuLabel menu={menu} />
    </Link>
  );
};

export const AdminNavigation = (): JSX.Element => {
  const pathname = window.location.pathname;

  const { data: growiCloudUri } = useGrowiCloudUri();
  const { data: growiAppIdForGrowiCloud } = useGrowiAppIdForGrowiCloud();

  const isActiveMenu = useCallback((path: string | string[]) => {
    const paths = Array.isArray(path) ? path : [path];

    return paths.some((path) => {
      const basisPath = pathUtils.normalizePath(urljoin('/admin', path));
      const basisParentPath = pathUtils.addTrailingSlash(basisPath);

      return (
        pathname === basisPath
        || pathname.startsWith(basisParentPath)
      );
    });

  }, [pathname]);

  const getListGroupItemOrDropdownItemList = (isListGroupItems: boolean) => {
    return (
      <>
        {/* eslint-disable no-multi-spaces */}
        <MenuLink menu="home"                       isListGroupItems={isListGroupItems} isActive={pathname === '/admin'} isRoot />
        <MenuLink menu="app"                        isListGroupItems={isListGroupItems} isActive={isActiveMenu('/app')} />
        <MenuLink menu="security"                   isListGroupItems={isListGroupItems} isActive={isActiveMenu('/security')} />
        <MenuLink menu="markdown"                   isListGroupItems={isListGroupItems} isActive={isActiveMenu('/markdown')} />
        <MenuLink menu="customize"                  isListGroupItems={isListGroupItems} isActive={isActiveMenu('/customize')} />
        <MenuLink menu="importer"                   isListGroupItems={isListGroupItems} isActive={isActiveMenu('/importer')} />
        <MenuLink menu="export"                     isListGroupItems={isListGroupItems} isActive={isActiveMenu('/export')} />
        <MenuLink menu="data-transfer"              isListGroupItems={isListGroupItems} isActive={isActiveMenu('/data-transfer')} />
        <MenuLink menu="notification"               isListGroupItems={isListGroupItems} isActive={isActiveMenu(['/notification', '/global-notification'])} />
        <MenuLink menu="slack-integration"          isListGroupItems={isListGroupItems} isActive={isActiveMenu('/slack-integration')} />
        <MenuLink menu="slack-integration-legacy"   isListGroupItems={isListGroupItems} isActive={isActiveMenu('/slack-integration-legacy')} />
        <MenuLink menu="users"                      isListGroupItems={isListGroupItems} isActive={isActiveMenu('/users')} />
        <MenuLink menu="user-groups"                isListGroupItems={isListGroupItems} isActive={isActiveMenu(['/user-groups', 'user-group-detail'])} />
        <MenuLink menu="audit-log"                  isListGroupItems={isListGroupItems} isActive={isActiveMenu('/audit-log')} />
        <MenuLink menu="plugins"                    isListGroupItems={isListGroupItems} isActive={isActiveMenu('/plugins')} />
        <MenuLink menu="search"                     isListGroupItems={isListGroupItems} isActive={isActiveMenu('/search')} />
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
        {/* eslint-enable no-multi-spaces */}
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
            {/* eslint-disable no-multi-spaces */}
            {pathname === '/admin'                  && <MenuLabel menu="home" />}
            {isActiveMenu('/app')                   && <MenuLabel menu="app" />}
            {isActiveMenu('/security')              && <MenuLabel menu="security" />}
            {isActiveMenu('/markdown')              && <MenuLabel menu="markdown" />}
            {isActiveMenu('/customize')             && <MenuLabel menu="customize" />}
            {isActiveMenu('/importer')              && <MenuLabel menu="importer" />}
            {isActiveMenu('/export')                && <MenuLabel menu="export" />}
            {(isActiveMenu(['/notification', '/global-notification']))
                                                    && <MenuLabel menu="notification" />}
            {isActiveMenu('/slack-integration')     && <MenuLabel menu="slack-integration" />}
            {isActiveMenu('/users')                 && <MenuLabel menu="users" />}
            {isActiveMenu(['/user-groups', 'user-group-detail'])
                                                    && <MenuLabel menu="user-groups" />}
            {isActiveMenu('/search')                && <MenuLabel menu="search" />}
            {isActiveMenu('/audit-log')             && <MenuLabel menu="audit-log" />}
            {isActiveMenu('/plugins')               && <MenuLabel menu="plugins" />}
            {isActiveMenu('/data-transfer')         && <MenuLabel menu="data-transfer" />}
            {/* eslint-enable no-multi-spaces */}
          </span>
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdown-admin-navigation">
          {getListGroupItemOrDropdownItemList(false)}
        </div>
      </div>

    </React.Fragment>
  );
};
