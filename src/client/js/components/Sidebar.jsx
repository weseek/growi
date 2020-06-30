import React from 'react';
import PropTypes from 'prop-types';

import {
  withNavigationUIController,
  LayoutManager,
  NavigationProvider,
  ThemeProvider,
} from '@atlaskit/navigation-next';

import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';
import NavigationContainer from '../services/NavigationContainer';

import SidebarNav from './Sidebar/SidebarNav';
import SidebarContents from './Sidebar/SidebarContents';
import StickyStretchableScroller from './StickyStretchableScroller';

const sidebarDefaultWidth = 320;

class Sidebar extends React.Component {

  static propTypes = {
    appContainer: PropTypes.instanceOf(AppContainer).isRequired,
    navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
    navigationUIController: PropTypes.any.isRequired,
    isDrawerModeOnInit: PropTypes.bool,
  };

  componentWillMount() {
    this.hackUIController();
  }

  componentDidUpdate(prevProps, prevState) {
    this.toggleDrawerMode(this.isDrawerMode);
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

  /**
   * return whether drawer mode or not
   */
  get isDrawerMode() {
    let isDrawerMode = this.props.navigationContainer.state.isDrawerMode;
    if (isDrawerMode == null) {
      isDrawerMode = this.props.isDrawerModeOnInit;
    }
    return isDrawerMode;
  }

  toggleDrawerMode(bool) {
    const { navigationUIController } = this.props;

    const isStateModified = navigationUIController.state.isResizeDisabled !== bool;
    if (!isStateModified) {
      return;
    }

    // Drawer <-- Dock
    if (bool) {
      // cache state
      this.sidebarCollapsedCached = navigationUIController.state.isCollapsed;
      this.sidebarWidthCached = navigationUIController.state.productNavWidth;

      // clear transition temporary
      if (this.sidebarCollapsedCached) {
        this.addCssClassTemporary('grw-sidebar-supress-transitions-to-drawer');
      }

      navigationUIController.disableResize();

      // fix width
      navigationUIController.setState({ productNavWidth: sidebarDefaultWidth });
    }
    // Drawer --> Dock
    else {
      // clear transition temporary
      if (this.sidebarCollapsedCached) {
        this.addCssClassTemporary('grw-sidebar-supress-transitions-to-dock');
      }

      navigationUIController.enableResize();

      // restore width
      if (this.sidebarWidthCached != null) {
        navigationUIController.setState({ productNavWidth: this.sidebarWidthCached });
      }
    }
  }

  get sidebarElem() {
    return document.querySelector('.grw-sidebar');
  }

  addCssClassTemporary(className) {
    // clear
    this.sidebarElem.classList.add(className);

    // restore after 300ms
    setTimeout(() => {
      this.sidebarElem.classList.remove(className);
    }, 300);
  }

  backdropClickedHandler = () => {
    const { navigationContainer } = this.props;
    navigationContainer.setState({ isDrawerOpened: false });
  }

  itemSelectedHandler = (contentsId) => {
    const { navigationContainer, navigationUIController } = this.props;
    const { sidebarContentsId } = navigationContainer.state;

    // already selected
    if (sidebarContentsId === contentsId) {
      navigationUIController.toggleCollapse();
    }
    // switch and expand
    else {
      navigationUIController.expand();
    }
  }

  calcViewHeight() {
    const containerElem = document.querySelector('#grw-sidebar-content-container');
    return window.innerHeight - containerElem.getBoundingClientRect().top;
  }

  renderGlobalNavigation = () => (
    <SidebarNav onItemSelected={this.itemSelectedHandler} />
  );

  renderSidebarContents = () => {
    const scrollTargetSelector = 'div[data-testid="ContextualNavigation"] div[role="group"]';

    return (
      <>
        <StickyStretchableScroller
          scrollTargetSelector={scrollTargetSelector}
          contentsElemSelector="#grw-sidebar-content-container"
          stickyElemSelector=".grw-sidebar"
          calcViewHeightFunc={this.calcViewHeight}
        />
        <div id="grw-sidebar-content-container" className="grw-sidebar-content-container">
          <SidebarContents />
        </div>
      </>
    );
  };

  render() {
    const { isDrawerOpened } = this.props.navigationContainer.state;

    return (
      <>
        <div className={`grw-sidebar d-print-none ${this.isDrawerMode ? 'grw-sidebar-drawer' : ''} ${isDrawerOpened ? 'open' : ''}`}>
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
              experimental_fullWidthFlyout
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


const SidebarWithNavigationUIController = withNavigationUIController(Sidebar);

/**
 * Wrapper component for using unstated
 */

const SidebarWithNavigation = (props) => {
  const { preferDrawerModeByUser: isDrawerModeOnInit } = props.navigationContainer.state;

  const initUICForDrawerMode = isDrawerModeOnInit
    // generate initialUIController for Drawer mode
    ? {
      isCollapsed: false,
      isResizeDisabled: true,
      productNavWidth: sidebarDefaultWidth,
    }
    // set undefined (should be initialized by cache)
    : undefined;

  return (
    <NavigationProvider initialUIController={initUICForDrawerMode}>
      <SidebarWithNavigationUIController {...props} isDrawerModeOnInit={isDrawerModeOnInit} />
    </NavigationProvider>
  );
};

SidebarWithNavigation.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withUnstatedContainers(SidebarWithNavigation, [AppContainer, NavigationContainer]);
