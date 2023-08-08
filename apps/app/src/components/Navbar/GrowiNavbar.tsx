import React, {
  FC, memo, useMemo, useRef,
} from 'react';

import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRipple } from 'react-use-ripple';
import { UncontrolledTooltip } from 'reactstrap';

import {
  useIsSearchPage, useIsGuestUser, useIsReadOnlyUser, useIsSearchServiceConfigured, useAppTitle, useConfidential,
} from '~/stores/context';
import { usePageCreateModal } from '~/stores/modal';
import { useCurrentPagePath } from '~/stores/page';
import { useIsDeviceSmallerThanMd } from '~/stores/ui';


import { GlobalSearchProps } from './GlobalSearch';

import styles from './GrowiNavbar.module.scss';

const NavbarRight = memo((): JSX.Element => {
  const { t } = useTranslation();

  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  // ripple
  const newButtonRef = useRef(null);
  useRipple(newButtonRef, { rippleColor: 'rgba(255, 255, 255, 0.3)' });

  const { open: openCreateModal } = usePageCreateModal();

  const isAuthenticated = isGuestUser === false;

  const authenticatedNavItem = useMemo(() => {
    return (
      <>
        {!isReadOnlyUser
          && <li className="nav-item d-none d-md-block">
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
        }
      </>
    );
  }, [isReadOnlyUser, t, openCreateModal, currentPagePath]);

  const notAuthenticatedNavItem = useMemo(() => {
    return (
      <>
        <li id="login-user" className="nav-item"><a className="nav-link" href="/login">Login</a></li>
      </>
    );
  }, []);

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

  return (
    <nav id="grw-navbar" className={`navbar grw-navbar ${styles['grw-navbar']} navbar-expand navbar-dark sticky-top mb-0 px-0`}>

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
