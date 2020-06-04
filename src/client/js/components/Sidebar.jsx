import React from 'react';
import PropTypes from 'prop-types';

import {
  withNavigationUIController,
  LayoutManager,
  NavigationProvider,
  ThemeProvider,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

import SidebarNav from './Sidebar/SidebarNav';
import RecentChanges from './Sidebar/RecentChanges';
import CustomSidebar from './Sidebar/CustomSidebar';


const sidebarDefaultWidth = 240;

class Sidebar extends React.Component {

  static propTypes = {
    appContainer: PropTypes.instanceOf(AppContainer).isRequired,
    navigationUIController: PropTypes.any.isRequired,
  };

  state = {
    isDrawerMode: this.props.appContainer.state.preferDrowerModeByUser,
    currentContentsId: 'recent',
  };

  componentWillMount() {
    this.hackUIController();
    this.initBreakpointEvents();
  }

  /**
   * hack and override UIController.storeState
   *
   * Since UIController is an unstated container, setState() in storeState method should be awaited before writing to cache.
   */
  hackUIController() {
    const { navigationUIController } = this.props;

    // see: @atlaskit/navigation-next/dist/esm/ui-controller/UIController.js
    const orgStoreState = navigationUIController.storeState;
    navigationUIController.storeState = async(state) => {
      await navigationUIController.setState(state);
      orgStoreState(state);
    };
  }

  initBreakpointEvents() {
    const { appContainer, navigationUIController } = this.props;

    const mdOrAvobeHandler = (mql) => {
      // sm -> md
      if (mql.matches) {
        if (appContainer.state.preferDrowerModeByUser) {
          this.toggleDrawerMode(true);
        }
        else {
          this.toggleDrawerMode(false);
        }
      }
      // md -> sm
      else {
        // cache width
        this.sidebarWidthCached = navigationUIController.state.productNavWidth;

        this.toggleDrawerMode(true);
      }
    };

    appContainer.addBreakpointListener('md', mdOrAvobeHandler, true);
  }

  toggleDrawerMode(bool) {
    const { appContainer, navigationUIController } = this.props;

    this.setState({ isDrawerMode: bool });

    // Drawer
    if (bool) {
      appContainer.setState({ isDrawerOpened: false });
      navigationUIController.disableResize();
      navigationUIController.expand();

      // fix width
      navigationUIController.setState({ productNavWidth: sidebarDefaultWidth });
    }
    // Dock
    else {
      appContainer.setState({ isDrawerOpened: false });
      navigationUIController.enableResize();

      // restore width
      if (this.sidebarWidthCached != null) {
        navigationUIController.setState({ productNavWidth: this.sidebarWidthCached });
      }
    }
  }

  backdropClickedHandler = () => {
    const { appContainer } = this.props;
    appContainer.setState({ isDrawerOpened: false });
  }

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
  }

  renderGlobalNavigation = () => (
    <SidebarNav currentContentsId={this.state.currentContentsId} onItemSelected={this.itemSelectedHandler} />
  );

  renderSidebarContents = () => {
    let contents = <CustomSidebar />;

    switch (this.state.currentContentsId) {
      case 'recent':
        contents = <RecentChanges />;
        break;
    }

    return <div className="grw-sidebar-content-container">{contents}</div>;
  }

  render() {
    const { isDrawerMode } = this.state;
    const { isDrawerOpened } = this.props.appContainer.state;

    return (
      <>
        <div className={`grw-sidebar ${isDrawerMode ? 'grw-sidebar-drawer' : ''} ${isDrawerOpened ? 'open' : ''}`}>
          <ThemeProvider
            theme={theme => ({
              ...theme,
              context: 'product',
            })}
          >
            <LayoutManager
              globalNavigation={this.renderGlobalNavigation}
              productNavigation={() => null}
              containerNavigation={this.renderSidebarContents}
              experimental_hideNavVisuallyOnCollapse
              experimental_flyoutOnHover
              experimental_alternateFlyoutBehaviour
              // experimental_fullWidthFlyout
              shouldHideGlobalNavShadow
              showContextualNavigation
            >
            </LayoutManager>
          </ThemeProvider>
        </div>

        { isDrawerOpened && (
          <div className="grw-sidebar-backdrop modal-backdrop show" onClick={this.backdropClickedHandler}></div>
        ) }
      </>
    );
  }

}

const SidebarWithNavigationUI = withNavigationUIController(Sidebar);

/**
 * Wrapper component for using unstated
 */
const SidebarWrapper = (props) => {
  return createSubscribedElement(SidebarWithNavigationUI, props, [AppContainer]);
};

export default () => (
  <NavigationProvider><SidebarWrapper /></NavigationProvider>
);
