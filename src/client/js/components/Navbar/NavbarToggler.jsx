import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

const NavbarToggler = (props) => {

  const { appContainer } = props;

  const clickHandler = () => {
    appContainer.setState({ isDrawerOpened: true });
  };

  return (
    <button className="navbar-toggler grw-navbar-toggler border-0" type="button" aria-expanded="false" aria-label="Toggle navigation" onClick={clickHandler}>
      <i className="icon-menu"></i>
    </button>
  );

};

/**
 * Wrapper component for using unstated
 */
const NavbarTogglerWrapper = (props) => {
  return createSubscribedElement(NavbarToggler, props, [AppContainer]);
};


NavbarToggler.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(NavbarTogglerWrapper);
