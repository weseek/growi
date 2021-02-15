import dynamic from 'next/dynamic';
import React from 'react';

import { useTranslation } from '~/i18n';
import {
  useAppTitle, useConfidential, useCurrentUser, useSearchServiceConfigured,
} from '~/stores/context';
import { useIsDeviceSmallerThanMd, usePageCreateModalOpened } from '~/stores/ui';


import GrowiLogo from '../Icons/GrowiLogo';

import PersonalDropdown from './PersonalDropdown';


const AppTilte = () => {
  const { data } = useAppTitle();
  return <>{data || 'GROWI'}</>;
};

const Confidential = () => {
  const { data } = useConfidential();

  if (data == null) {
    return null;
  }

  return (
    <li className="nav-item confidential text-light">
      <i className="icon-info d-md-none" data-toggle="tooltip" title={data} />
      <span className="d-none d-md-inline">
        {data}
      </span>
    </li>
  );
};

const NavbarRight = () => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { mutate: openPageCreateModal } = usePageCreateModalOpened();

  // render login button
  if (currentUser == null) {
    return <li id="login-user" className="nav-item"><a className="nav-link" href="/login">Login</a></li>;
  }

  return (
    <>
      <li className="nav-item d-none d-md-block">
        <button className="px-md-2 nav-link btn-create-page border-0 bg-transparent" type="button" onClick={() => openPageCreateModal(true)}>
          <i className="icon-pencil mr-2"></i>
          <span className="d-none d-lg-block">{ t('New') }</span>
        </button>
      </li>

      <li className="grw-personal-dropdown nav-item dropdown dropdown-toggle dropdown-toggle-no-caret">
        <PersonalDropdown />
      </li>
    </>
  );
};


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const GrowiNavbar = () => {
  // const { navigationContainer } = props;

  const { data: isSearchServiceConfigured } = useSearchServiceConfigured();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();

  // dynamic import to skip rendering at SSR
  const GlobalSearch = dynamic(() => import('./GlobalSearch'), { ssr: false });

  return (

    <nav className="navbar grw-navbar navbar-expand navbar-dark sticky-top mb-0 px-0">

      {/* Brand Logo  */}
      <div className="navbar-brand mr-0">
        <a className="grw-logo d-block" href="/">
          <GrowiLogo />
        </a>
      </div>

      <div className="grw-app-title d-none d-md-block">
        <AppTilte />
      </div>


      {/* Navbar Right  */}
      <ul className="navbar-nav ml-auto">
        <NavbarRight />
        <Confidential />
      </ul>

      { isSearchServiceConfigured && !isDeviceSmallerThanMd && (
        <div className="grw-global-search grw-global-search-top position-absolute">
          <GlobalSearch />
        </div>
      ) }
    </nav>
  );

};

export default GrowiNavbar;
