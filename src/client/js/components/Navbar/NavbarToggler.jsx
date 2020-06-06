import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

const NavbarToggler = (props) => {

  const { appContainer } = props;

  const clickHandler = () => {
    appContainer.toggleDrawer();
  };

  return (
    <a
      className="nav-link grw-navbar-toggler border-0 waves-effect waves-light"
      type="button"
      aria-expanded="false"
      aria-label="Toggle navigation"
      onClick={clickHandler}
    >
      <i className="icon-menu"></i>
    </a>
  );

};

/**
 * Wrapper component for using unstated
 */
const NavbarTogglerWrapper = withUnstatedContainers(NavbarToggler, [AppContainer]);


NavbarToggler.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(NavbarTogglerWrapper);
