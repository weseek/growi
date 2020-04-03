import React from 'react';
// import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  LayoutManager,
  NavigationProvider,
  ThemeProvider, modeGenerator,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

import SidebarNav from './Sidebar/SidebarNav';
import History from './Sidebar/History';

class Sidebar extends React.Component {

  static propTypes = {
  };

  state = {
  };

  renderSidebarContents = () => (
    <History></History>
  );

  render() {
    return (
      <ThemeProvider
        theme={theme => ({
          ...theme,
          context: 'product',
          mode: modeGenerator({
            product: { text: '#ffffff', background: '#334455' },
          }),
        })}
      >
        <NavigationProvider>
          <LayoutManager
            globalNavigation={SidebarNav}
            productNavigation={() => null}
            containerNavigation={this.renderSidebarContents}
            experimental_flyoutOnHover
            experimental_alternateFlyoutBehaviour
            // experimental_fullWidthFlyout
            shouldHideGlobalNavShadow
            showContextualNavigation
          >
          </LayoutManager>
        </NavigationProvider>
      </ThemeProvider>
    );
  }

}


/**
 * Wrapper component for using unstated
 */
const SidebarWrapper = (props) => {
  return createSubscribedElement(Sidebar, props, [AppContainer]);
};

export default withTranslation()(SidebarWrapper);
