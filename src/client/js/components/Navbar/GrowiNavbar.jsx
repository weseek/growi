import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';

class GrowiNavbar extends React.Component {

  render() {
    return (
      <p>hoge</p>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const GrowiNavbarWrapper = withUnstatedContainers(GrowiNavbar, [NavigationContainer]);


GrowiNavbar.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(GrowiNavbarWrapper);
