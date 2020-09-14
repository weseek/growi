import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  useAppTitle, useConfidential, useCurrentUser,
} from '~/stores/context';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import AppContainer from '../../services/AppContainer';

import GrowiLogo from '../GrowiLogo';

// import PersonalDropdown from './PersonalDropdown';
import GlobalSearch from './GlobalSearch';


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

const NavbarRight = (props) => {
  const { t, navigationContainer } = props;
  const { data: currentUser } = useCurrentUser();

  // render login button
  if (currentUser == null) {
    return <li id="login-user" className="nav-item"><a className="nav-link" href="/login">Login</a></li>;
  }

  return (
    <>
      <li className="nav-item d-none d-md-block">
        <button className="px-md-2 nav-link btn-create-page border-0 bg-transparent" type="button" onClick={navigationContainer.openPageCreateModal}>
          <i className="icon-pencil mr-2"></i>
          <span className="d-none d-lg-block">{ t('New') }</span>
        </button>
      </li>

      <li className="grw-personal-dropdown nav-item dropdown dropdown-toggle dropdown-toggle-no-caret">
        {/* <PersonalDropdown /> */}
      </li>
    </>
  );
};
NavbarRight.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};


const GrowiNavbar = (props) => {

  // const { crowi, isSearchServiceConfigured } = appContainer.config;
  // const { isDeviceSmallerThanMd } = navigationContainer.state;

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
        <NavbarRight {...props} />
      </ul>

      <Confidential />

      {/* { isSearchServiceConfigured && !isDeviceSmallerThanMd && (
        <div className="grw-global-search grw-global-search-top position-absolute">
          <GlobalSearch />
        </div>
      ) } */}
    </nav>
  );

};

/**
 * Wrapper component for using unstated
 */
const GrowiNavbarWrapper = withUnstatedContainers(GrowiNavbar, [AppContainer, NavigationContainer]);


GrowiNavbar.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(GrowiNavbarWrapper);
