import React, {
  FC, memo, useMemo, useRef,
} from 'react';

import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRipple } from 'react-use-ripple';
import { UncontrolledTooltip } from 'reactstrap';

import {
  useIsSearchPage, useIsGuestUser, useIsSearchServiceConfigured, useAppTitle, useConfidential, useIsDefaultLogo,
} from '~/stores/context';
import { usePageCreateModal } from '~/stores/modal';
import { useCurrentPagePath } from '~/stores/page';
import { useIsDeviceSmallerThanMd } from '~/stores/ui';

import GrowiLogo from '../Icons/GrowiLogo';

import { GlobalSearchProps } from './GlobalSearch';

import styles from './GrowiNavbar.module.scss';

const PersonalDropdown = dynamic(() => import('./PersonalDropdown'), { ssr: false });
const InAppNotificationDropdown = dynamic(() => import('../InAppNotification/InAppNotificationDropdown')
  .then(mod => mod.InAppNotificationDropdown), { ssr: false });
const AppearanceModeDropdown = dynamic(() => import('./AppearanceModeDropdown').then(mod => mod.AppearanceModeDropdown), { ssr: false });

const NavbarRight = memo((): JSX.Element => {
  const { t } = useTranslation();

  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isGuestUser } = useIsGuestUser();

  // ripple
  const newButtonRef = useRef(null);
  useRipple(newButtonRef, { rippleColor: 'rgba(255, 255, 255, 0.3)' });

  const { open: openCreateModal } = usePageCreateModal();

  const isAuthenticated = isGuestUser === false;

  const authenticatedNavItem = useMemo(() => {
    return (
      <>
        <li className="nav-item">
          <InAppNotificationDropdown />
        </li>

        <li className="nav-item d-none d-md-block">
          <button
            className="px-md-3 nav-link btn-create-page border-0 bg-transparent"
            type="button"
            ref={newButtonRef}
            data-testid="newPageBtn"
            onClick={() => openCreateModal(currentPagePath || '')}
          >
            <i className="icon-pencil mr-2"></i>
            <span className="d-none d-lg-block">{ t('commons:New') }</span>
          </button>
        </li>

        <li className="grw-apperance-mode-dropdown nav-item dropdown">
          <AppearanceModeDropdown isAuthenticated={isAuthenticated} />
        </li>

        <li className="grw-personal-dropdown nav-item dropdown dropdown-toggle dropdown-toggle-no-caret" data-testid="grw-personal-dropdown">
          <PersonalDropdown />
        </li>
      </>
    );
  }, [t, isAuthenticated, openCreateModal, currentPagePath]);

  const notAuthenticatedNavItem = useMemo(() => {
    return (
      <>
        <li className="grw-apperance-mode-dropdown nav-item dropdown">
          <AppearanceModeDropdown isAuthenticated={isAuthenticated} />
        </li>
        <li id="login-user" className="nav-item"><a className="nav-link" href="/login">Login</a></li>
      </>
    );
  }, [isAuthenticated]);

  return (
    <>
      {isAuthenticated ? authenticatedNavItem : notAuthenticatedNavItem}
    </>
  );
});
NavbarRight.displayName = 'NavbarRight';

type ConfidentialProps = {
  confidential?: string,
}
const Confidential: FC<ConfidentialProps> = memo((props: ConfidentialProps): JSX.Element => {
  const { confidential } = props;

  if (confidential == null || confidential.length === 0) {
    return <></>;
  }

  return (
    <li className="nav-item confidential text-light">
      <i id="confidentialTooltip" className="icon-info d-md-none" />
      <span className="d-none d-md-inline">
        {confidential}
      </span>
      <UncontrolledTooltip
        placement="bottom"
        target="confidentialTooltip"
        className="d-md-none"
      >
        {confidential}
      </UncontrolledTooltip>
    </li>
  );
});
Confidential.displayName = 'Confidential';

interface NavbarLogoProps {
  isDefaultLogo?: boolean
}

const GrowiNavbarLogo: FC<NavbarLogoProps> = memo((props: NavbarLogoProps) => {
  const { isDefaultLogo } = props;

  return isDefaultLogo
    ? <GrowiLogo />
    // eslint-disable-next-line @next/next/no-img-element
    : (<img src='/attachment/brand-logo' alt="custom logo" className="picture picture-lg p-2 mx-2" id="settingBrandLogo" width="32" />);
});

GrowiNavbarLogo.displayName = 'GrowiNavbarLogo';

type Props = {
  isGlobalSearchHidden?: boolean
}

export const GrowiNavbar = (props: Props): JSX.Element => {

  const { isGlobalSearchHidden } = props;

  const GlobalSearch = dynamic<GlobalSearchProps>(() => import('./GlobalSearch').then(mod => mod.GlobalSearch), { ssr: false });

  const { data: appTitle } = useAppTitle();
  const { data: confidential } = useConfidential();
  const { data: isSearchServiceConfigured } = useIsSearchServiceConfigured();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { data: isSearchPage } = useIsSearchPage();
  const { data: isDefaultLogo } = useIsDefaultLogo();

  return (
    <nav id="grw-navbar" className={`navbar grw-navbar ${styles['grw-navbar']} navbar-expand navbar-dark sticky-top mb-0 px-0`}>
      {/* Brand Logo  */}
      <div className="navbar-brand mr-0">
        <Link href="/" className="grw-logo d-block">
          <GrowiNavbarLogo isDefaultLogo={isDefaultLogo} />
        </Link>
      </div>

      <div className="grw-app-title d-none d-md-block">
        {appTitle}
      </div>

      {/* Navbar Right  */}
      <ul className="navbar-nav ml-auto">
        <NavbarRight />
        <Confidential confidential={confidential} />
      </ul>

      <div className="grw-global-search-container position-absolute">
        { !isGlobalSearchHidden && isSearchServiceConfigured && !isDeviceSmallerThanMd && !isSearchPage && (
          <GlobalSearch />
        ) }
      </div>
    </nav>
  );

};
