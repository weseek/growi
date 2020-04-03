import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  withNavigationUIController,
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
    navigationUIController: PropTypes.any.isRequired,
  };

  state = {
    currentContentsId: 'custom',
    isDrawerOpen: false,
  };

  openDrawer = () => this.setState({ isDrawerOpen: true });

  closeDrawer = () => this.setState({ isDrawerOpen: false });

  itemSelectedHandler = (contentsId) => {
    const { navigationUIController } = this.props;
    const { currentContentsId } = this.state;

    // already selected
    if (currentContentsId === contentsId) {
      navigationUIController.toggleCollapse();
    }
    // switch and expand
    else {
      this.setState({ currentContentsId: contentsId });
      navigationUIController.expand();
    }

    // if (contentsId === 'drawer') {
    //   this.openDrawer();
    // }
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
        <LayoutManager
          globalNavigation={this.GlobalNavigation}
          productNavigation={() => null}
          containerNavigation={this.SidebarContents}
          experimental_hideNavVisuallyOnCollapse
          experimental_flyoutOnHover
          experimental_alternateFlyoutBehaviour
          // experimental_fullWidthFlyout
          shouldHideGlobalNavShadow
          showContextualNavigation
        >
        </LayoutManager>
      </ThemeProvider>
    );
  }

}

const SidebarWithNavigationUI = withNavigationUIController(Sidebar);
const SidebarWithNavigationUIAndTranslation = withTranslation()(SidebarWithNavigationUI);

/**
 * Wrapper component for using unstated
 */
const SidebarWrapper = (props) => {
  return createSubscribedElement(SidebarWithNavigationUIAndTranslation, props, [AppContainer]);
};

export default () => (
  <NavigationProvider><SidebarWrapper /></NavigationProvider>
);
