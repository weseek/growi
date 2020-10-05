import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import AppContainer from '../../services/AppContainer';

import GrowiLogo from '../Icons/GrowiLogo';

import PersonalDropdown from './PersonalDropdown';
import GlobalSearch from './GlobalSearch';

class GrowiNavbar extends React.Component {

  renderNavbarRight() {
    const { t, appContainer, navigationContainer } = this.props;
    const { currentUser } = appContainer;

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
    const { appContainer, navigationContainer } = this.props;
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
          {this.renderNavbarRight()}
        </ul>

        {crowi.confidential != null && this.renderConfidential()}

        { isSearchServiceConfigured && !isDeviceSmallerThanMd && (
          <div className="grw-global-search grw-global-search-top position-absolute">
            <GlobalSearch />
          </div>
        ) }
      </>
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
