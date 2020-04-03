import React from 'react';
// import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  LayoutManager,
  NavigationProvider,
  ThemeProvider, modeGenerator,
} from '@atlaskit/navigation-next';

import Drawer from '@atlaskit/drawer';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

import GrowiLogo from './GrowiLogo';
import SidebarNav from './Sidebar/SidebarNav';
import History from './Sidebar/History';

class Sidebar extends React.Component {

  static propTypes = {
  };

  state = {
    isDrawerOpen: false,
  };

  openDrawer = () => this.setState({ isDrawerOpen: true });

  closeDrawer = () => this.setState({ isDrawerOpen: false });

  itemSelectedHandler = (contentsId) => {
    if (contentsId === 'drawer') {
      this.openDrawer();
    }
  }

  GlobalNavigation = () => (
    <>
      <div className="grw-logo">
        <a href="/"><GrowiLogo /></a>
      </div>
      <SidebarNav onItemSelected={this.itemSelectedHandler} />
      <Drawer onClose={this.closeDrawer} isOpen={this.state.isDrawerOpen} width="wide">
        <code>Drawer contents</code>
      </Drawer>
    </>
  );

  SidebarContents = () => (
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
            globalNavigation={this.GlobalNavigation}
            productNavigation={() => null}
            containerNavigation={this.SidebarContents}
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
