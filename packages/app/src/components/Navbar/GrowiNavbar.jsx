import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import { UncontrolledTooltip } from 'reactstrap';

import NavigationContainer from '~/client/services/NavigationContainer';
import AppContainer from '~/client/services/AppContainer';
import { usePageCreateModalOpened } from '~/stores/ui';

import { withUnstatedContainers } from '../UnstatedUtils';
import GrowiLogo from '../Icons/GrowiLogo';

import PersonalDropdown from './PersonalDropdown';
import GlobalSearch from './GlobalSearch';

const NavbarRight = React.memo(({ currentUser }) => {
  const { t } = useTranslation();
  const { mutate: mutatePageCreateModalOpened } = usePageCreateModalOpened();

  // render login button
  if (currentUser == null) {
    return <li id="login-user" className="nav-item"><a className="nav-link" href="/login">Login</a></li>;
  }

  return (
    <>
      <li className="nav-item d-none d-md-block">
        <button
          className="px-md-2 nav-link btn-create-page border-0 bg-transparent"
          type="button"
          onClick={() => mutatePageCreateModalOpened(true)}
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


const Confidential = React.memo(({ confidential }) => {
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

  const { appContainer, navigationContainer } = props;
  const { currentUser } = appContainer;
  const { crowi, isSearchServiceConfigured } = appContainer.config;
  const { isDeviceSmallerThanMd } = navigationContainer.state;

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

      { isSearchServiceConfigured && !isDeviceSmallerThanMd && (
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
const GrowiNavbarWrapper = withUnstatedContainers(GrowiNavbar, [AppContainer, NavigationContainer]);


GrowiNavbar.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default GrowiNavbarWrapper;
