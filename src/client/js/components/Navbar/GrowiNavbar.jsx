import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import AppContainer from '../../services/AppContainer';

import PageCreateButton from './PageCreateButton';
import PersonalDropdown from './PersonalDropdown';
import GrowiLogo from '../GrowiLogo';

class GrowiNavbar extends React.Component {

  renderNavbarRight() {
    const { appContainer } = this.props;
    const isReachable = appContainer.config.isSearchServiceReachable;

    return (
      <>
        <li className="nav-item d-none d-md-block">
          <PageCreateButton />
        </li>

        {isReachable
         && (
         <li className="nav-item d-md-none">
           <a type="button" className="nav-link px-4" data-target="#grw-search-top-collapse" data-toggle="collapse">
             <i className="icon-magnifier mr-2"></i>
           </a>
         </li>
         )}

        <li className="grw-personal-dropdown nav-item dropdown dropdown-toggle dropdown-toggle-no-caret">
          <PersonalDropdown />
        </li>
      </>
    );
  }

  renderConfidential() {
    const { appContainer } = this.props;
    const { crowi } = appContainer.config;

    return (
      <li className="nav-item confidential text-light">
        <i className="icon-info d-md-none" data-toggle="tooltip" title={crowi.confidential} />
        <span className="d-none d-md-inline">
          {crowi.confidential}
        </span>
      </li>
    );
  }

  render() {
    const { appContainer } = this.props;
    const { crowi } = appContainer.config;
    const { currentUser } = appContainer;

    return (
      <nav className="navbar grw-navbar navbar-expand navbar-dark sticky-top mb-0 px-0">

        {/* Brand Logo  */}
        <div className="navbar-brand mr-0">
          <a className="grw-logo d-block" href="/">
            <GrowiLogo />
          </a>
        </div>

        <ul className="navbar-nav d-md-none">
          <li id="grw-navbar-toggler" className="nav-item"></li>
        </ul>
        <div className="grw-app-title d-none d-md-block">
          {crowi.title}
        </div>


        {/* Navbar Right  */}
        <ul className="navbar-nav ml-auto">
          {currentUser != null ? this.renderNavbarRight() : <li id="login-user" className="nav-item"><a className="nav-link" href="/login">Login</a></li>}
        </ul>

        {crowi.confidential != null && this.renderConfidential()}
      </nav>
    );
  }

}

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
