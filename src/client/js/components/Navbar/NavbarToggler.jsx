import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';

const NavbarToggler = (props) => {

  const { navigationContainer } = props;

  const clickHandler = useCallback(() => {
    navigationContainer.toggleDrawer();
  }, []);

  const iconClass = props.iconClass || 'icon-menu';

  return (
    <button
      className="grw-navbar-toggler btn btn-secondary btn-xl"
      type="button"
      aria-expanded="false"
      aria-label="Toggle navigation"
      onClick={clickHandler}
    >
      <i className={iconClass}></i>
    </button>
  );

};

/**
 * Wrapper component for using unstated
 */
const NavbarTogglerWrapper = withUnstatedContainers(NavbarToggler, [NavigationContainer]);


NavbarToggler.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,

  iconClass: PropTypes.string,
};

export default withTranslation()(NavbarTogglerWrapper);
