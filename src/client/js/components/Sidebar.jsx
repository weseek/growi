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

import SidebarNav from './Sidebar/SidebarNav';
import RecentChanges from './Sidebar/RecentChanges';
import CustomSidebar from './Sidebar/CustomSidebar';


const sidebarDefaultWidth = 240;

class Sidebar extends React.Component {

  static propTypes = {
    appContainer: PropTypes.instanceOf(AppContainer).isRequired,
    navigationUIController: PropTypes.any.isRequired,
    isDrawerModeOnInit: PropTypes.bool,
  };

  state = {
    currentContentsId: 'recent',
  };

  componentWillMount() {
    this.hackUIController();
  }

  componentDidUpdate(prevProps, prevState) {
    const { appContainer } = this.props;

    let isDrawerMode = appContainer.state.isDrawerMode;
    if (isDrawerMode == null) {
      isDrawerMode = this.props.isDrawerModeOnInit;
    }

    this.toggleDrawerMode(isDrawerMode);
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

  async toggleDrawerMode(bool) {
    const { navigationUIController } = this.props;

    const isStateModified = navigationUIController.state.isResizeDisabled !== bool;
    if (!isStateModified) {
      return;
    }

    // store transition and remove
    this.storeContextualNavigationTransition();

    // switch to Drawer
    if (bool) {
      // cache
      this.sidebarCollapsedCached = navigationUIController.state.isCollapsed;
      this.sidebarWidthCached = navigationUIController.state.productNavWidth;

      // clear transition temporary
      if (this.sidebarCollapsedCached) {
        this.clearNavigationTransitionTemporary(this.navigationElem);
      }

      navigationUIController.disableResize();

      // fix width
      navigationUIController.setState({ productNavWidth: sidebarDefaultWidth });
    }
    // switch to Dock
    else {
      // clear transition temporary when restore collapsed sidebar
      if (this.sidebarCollapsedCached) {
        this.clearNavigationTransitionTemporary(this.ctxNavigationElem);
      }

      navigationUIController.enableResize();

      // restore width
      if (this.sidebarWidthCached != null) {
        navigationUIController.setState({ productNavWidth: this.sidebarWidthCached });
      }
    }
  }

  get navigationElem() {
    return document.querySelector('div[data-testid="Navigation"]');
  }

  get ctxNavigationElem() {
    return document.querySelector('div[data-testid="ContextualNavigation"]');
  }

  clearNavigationTransitionTemporary(elem) {
    const transitionCache = elem.style.transition;

    // clear
    elem.style.transition = undefined;

    // restore after 300ms
    setTimeout(() => {
      elem.style.transition = transitionCache;
    }, 300);
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
    const { isDrawerMode, isDrawerOpened } = this.props.appContainer.state;

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


const SidebarWithNavigationUIController = withNavigationUIController(Sidebar);

/**
 * Wrapper component for using unstated
 */

const SidebarWithNavigation = (props) => {
  const { preferDrawerModeByUser: isDrawerModeOnInit } = props.appContainer.state;

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
};

export default withUnstatedContainers(SidebarWithNavigation, [AppContainer]);
