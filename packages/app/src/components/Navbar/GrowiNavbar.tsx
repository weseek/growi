import React, { FC, memo } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import { UncontrolledTooltip } from 'reactstrap';

import AppContainer from '~/client/services/AppContainer';
import { IUser } from '~/interfaces/user';
import { useIsDeviceSmallerThanMd, useCreateModalStatus } from '~/stores/ui';
import { useIsSearchPage } from '~/stores/context';

import { withUnstatedContainers } from '../UnstatedUtils';
import GrowiLogo from '../Icons/GrowiLogo';

import PersonalDropdown from './PersonalDropdown';
import GlobalSearch from './GlobalSearch';
import InAppNotificationDropdown from '../InAppNotification/InAppNotificationDropdown';


type NavbarRightProps = {
  currentUser: IUser,
}
const NavbarRight: FC<NavbarRightProps> = memo((props: NavbarRightProps) => {
  const { t } = useTranslation();
  const { open: openCreateModal } = useCreateModalStatus();

  const { currentUser } = props;

  // render login button
  if (currentUser == null) {
    return <li id="login-user" className="nav-item"><a className="nav-link" href="/login">Login</a></li>;
  }

  return (
    <>
      <li className="nav-item">
        <InAppNotificationDropdown />
      </li>

      <li className="nav-item d-none d-md-block">
        <button
          className="px-md-3 nav-link btn-create-page border-0 bg-transparent"
          type="button"
          onClick={() => openCreateModal()}
        >
          <i className="icon-pencil mr-2"></i>
          <span className="d-none d-lg-block">{ t('New') }</span>
        </button>
      </li>

      <li className="grw-personal-dropdown nav-item dropdown dropdown-toggle dropdown-toggle-no-caret">
        <PersonalDropdown />
      </li>
    </>
  );
});

type ConfidentialProps = {
  confidential?: string,
}
const Confidential: FC<ConfidentialProps> = memo((props: ConfidentialProps) => {
  const { confidential } = props;

  if (confidential == null) {
    return null;
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


const GrowiNavbar = (props) => {

  const { appContainer } = props;
  const { currentUser } = appContainer;
  const { crowi, isSearchServiceConfigured } = appContainer.config;

  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { data: isSearchPage } = useIsSearchPage();

  return (
    <>
      {/* Brand Logo  */}
      <div className="navbar-brand mr-0">
        <a className="grw-logo d-block" href="/">
          <GrowiLogo />
        </a>
      </div>

      <div className="grw-app-title d-none d-md-block">
        {crowi.title}
      </div>


      {/* Navbar Right  */}
      <ul className="navbar-nav ml-auto">
        <NavbarRight currentUser={currentUser}></NavbarRight>
        <Confidential confidential={crowi.confidential}></Confidential>
      </ul>

      { isSearchServiceConfigured && !isDeviceSmallerThanMd && !isSearchPage && (
        <div className="grw-global-search grw-global-search-top position-absolute">
          <GlobalSearch />
        </div>
      ) }
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const GrowiNavbarWrapper = withUnstatedContainers(GrowiNavbar, [AppContainer]);


GrowiNavbar.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default GrowiNavbarWrapper;
