/* eslint-disable no-multi-spaces */
/* eslint-disable react/jsx-props-no-multi-spaces */


import React, { VFC } from 'react';
import urljoin from 'url-join';
import { useEnvVars } from '~/stores/admin-context';
import { useTranslation } from '~/i18n';


// eslint-disable-next-line react/prop-types
const MenuLabel = ({ menu }) => {
  const { t } = useTranslation();

  switch (menu) {
    case 'app':           return <><i className="icon-fw icon-settings"></i>        { t('App Settings') }</>;
    case 'security':      return <><i className="icon-fw icon-shield"></i>          { t('security_settings') }</>;
    case 'markdown':      return <><i className="icon-fw icon-note"></i>            { t('Markdown Settings') }</>;
    case 'customize':     return <><i className="icon-fw icon-wrench"></i>          { t('Customize') }</>;
    case 'importer':      return <><i className="icon-fw icon-cloud-upload"></i>    { t('Import Data') }</>;
    case 'export':        return <><i className="icon-fw icon-cloud-download"></i>  { t('Export Archive Data') }</>;
    case 'notification':  return <><i className="icon-fw icon-bell"></i>            { t('Notification Settings') }</>;
    case 'users':         return <><i className="icon-fw icon-user"></i>            { t('User_Management') }</>;
    case 'user-groups':   return <><i className="icon-fw icon-people"></i>          { t('UserGroup Management') }</>;
    case 'search':        return <><i className="icon-fw icon-magnifier"></i>       { t('Full Text Search Management') }</>;
    case 'cloud':         return <><i className="icon-fw icon-share-alt"></i>       { t('to_cloud_settings')} </>;
    default:              return <><i className="icon-fw icon-home"></i>            { t('Wiki Management Home Page') }</>;
  }
};


type MenuLinkProps = {
  menu: string,
  isListGroupItems?: boolean,
  isActive?: boolean,
  isRoot?: boolean,
}

const MenuLink: VFC<MenuLinkProps> = ({
  // eslint-disable-next-line react/prop-types
  menu, isRoot, isListGroupItems, isActive,
}: MenuLinkProps) => {
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


const GrowiCloudMenuLink = (): JSX.Element | null => {
  const { data: envVars } = useEnvVars();

  if (envVars == null) {
    return null;
  }

  const growiCloudUri = envVars.GROWI_CLOUD_URI;
  const growiAppIdForGrowiCloud = envVars.GROWI_APP_ID_FOR_GROWI_CLOUD;

  if (growiCloudUri == null || growiAppIdForGrowiCloud == null) {
    return null;
  }

  return (
    <a
      href={`${growiCloudUri}/my/apps/${growiAppIdForGrowiCloud}`}
      className="list-group-item list-group-item-action border-0 round-corner"
    >
      <MenuLabel menu="cloud" />
    </a>
  );
};


type Props = {
  selected: string,
}

const AdminNavigation: VFC<Props> = (props: Props) => {
  const { selected } = props;

  const getListGroupItemOrDropdownItemList = (isListGroupItems) => {
    return (
      <>
        <MenuLink menu="home"         isListGroupItems={isListGroupItems} isActive={selected === 'home'} isRoot />
        <MenuLink menu="app"          isListGroupItems={isListGroupItems} isActive={selected === 'app'} />
        <MenuLink menu="security"     isListGroupItems={isListGroupItems} isActive={selected === 'security'} />
        <MenuLink menu="markdown"     isListGroupItems={isListGroupItems} isActive={selected === 'markdown'} />
        <MenuLink menu="customize"    isListGroupItems={isListGroupItems} isActive={selected === 'customize'} />
        <MenuLink menu="importer"     isListGroupItems={isListGroupItems} isActive={selected === 'importer'} />
        <MenuLink menu="export"       isListGroupItems={isListGroupItems} isActive={selected === 'export'} />
        <MenuLink menu="notification" isListGroupItems={isListGroupItems} isActive={selected === 'notification' || selected === 'global-notification'} />
        <MenuLink menu="users"        isListGroupItems={isListGroupItems} isActive={selected === 'users'} />
        <MenuLink menu="user-groups"  isListGroupItems={isListGroupItems} isActive={selected === 'user-groups'} />
        <MenuLink menu="search"       isListGroupItems={isListGroupItems} isActive={selected === 'search'} />
        <GrowiCloudMenuLink />
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
            {selected === 'home' &&         <MenuLabel menu="home" />}
            {selected === 'app' &&          <MenuLabel menu="app" />}
            {selected === 'security' &&     <MenuLabel menu="security" />}
            {selected === 'markdown' &&     <MenuLabel menu="markdown" />}
            {selected === 'customize' &&    <MenuLabel menu="customize" />}
            {selected === 'importer' &&     <MenuLabel menu="importer" />}
            {selected === 'export' &&       <MenuLabel menu="export" />}
            {(selected === 'notification' || selected === 'global-notification') && <MenuLabel menu="notification" />}
            {selected === 'users' &&        <MenuLabel menu="users" />}
            {selected === 'user-groups' &&  <MenuLabel menu="user-groups" />}
            {selected === 'search' &&       <MenuLabel menu="search" />}
          </span>
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdown-admin-navigation">
          {getListGroupItemOrDropdownItemList(false)}
        </div>
      </div>

    </React.Fragment>
  );
};

export default AdminNavigation;
