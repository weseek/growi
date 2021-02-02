import dynamic from 'next/dynamic';
import React, { useCallback } from 'react';
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

const sidebarDefaultWidth = 320;


type GlobalNavigationProps = {
  navigationContainer: NavigationContainer,
  navigationUIController: any, // UIController from @atlaskit/navigation-next
}

const GlobalNavigation = withUnstatedContainers(withNavigationUIController((props: GlobalNavigationProps): JSX.Element => {

  const itemSelectedHandler = (contentsId) => {
    const { navigationContainer, navigationUIController } = props;
    const { sidebarContentsId } = navigationContainer.state;

    // already selected
    if (sidebarContentsId === contentsId) {
      navigationUIController.toggleCollapse();
    }
    // switch and expand
    else {
      navigationUIController.expand();
    }
  };

  return <SidebarNav onItemSelected={itemSelectedHandler} />;
}), [NavigationContainer]);


const SidebarContents = () => {
  const scrollTargetSelector = '#grw-sidebar-contents-scroll-target';

  const StickyStretchableScroller = dynamic(() => import('~/client/js/components/StickyStretchableScroller'), { ssr: false });
  const DrawerToggler = dynamic(() => import('~/client/js/components/Navbar/DrawerToggler'), { ssr: false });
  const SidebarContents = dynamic(() => import('~/client/js/components/Sidebar/SidebarContents'), { ssr: false });

  const calcViewHeight = useCallback(() => {
    const scrollTargetElem = document.querySelector('#grw-sidebar-contents-scroll-target');
    return scrollTargetElem != null
      ? window.innerHeight - scrollTargetElem?.getBoundingClientRect().top
      : window.innerHeight;
  }, []);

  return (
    <>
      {/* <StickyStretchableScroller
        scrollTargetSelector={scrollTargetSelector}
        contentsElemSelector="#grw-sidebar-content-container"
        stickyElemSelector=".grw-sidebar"
        calcViewHeightFunc={calcViewHeight}
      /> */}

      <div id="grw-sidebar-contents-scroll-target">
        <div id="grw-sidebar-content-container">
          {/* TODO: set isSharedUser
          <SidebarContents
            isSharedUser={this.props.appContainer.isSharedUser}
          />
          */}
          <SidebarContents />
        </div>
      </div>

      <DrawerToggler iconClass="icon-arrow-left" />
    </>
  );
};


type Props = {
  appContainer: AppContainer,
  navigationContainer: NavigationContainer,
  navigationUIController: any,
  isDrawerModeOnInit?: boolean,
}

const Sidebar = (props: Props) => {

  const { navigationContainer, navigationUIController, isDrawerModeOnInit } = props;

  // componentWillMount() {
  //   this.hackUIController();
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   this.toggleDrawerMode(this.isDrawerMode);
  // }

  /**
   * hack and override UIController.storeState
   *
   * Since UIController is an unstated container, setState() in storeState method should be awaited before writing to cache.
   */
  // hackUIController() {
  //   const { navigationUIController } = this.props;

  //   // see: @atlaskit/navigation-next/dist/esm/ui-controller/UIController.js
  //   const orgStoreState = navigationUIController.storeState;
  //   navigationUIController.storeState = async(state) => {
  //     await navigationUIController.setState(state);
  //     orgStoreState(state);
  //   };
  // }

  /**
   * return whether drawer mode or not
   */
  const isDrawerMode = useCallback(() => {
    let isDrawerMode: boolean | null | undefined = navigationContainer.state.isDrawerMode;
    if (isDrawerMode == null) {
      isDrawerMode = isDrawerModeOnInit;
    }
    return isDrawerMode;
  }, [navigationContainer, isDrawerModeOnInit]);

  const toggleDrawerMode = useCallback((bool) => {
    const isStateModified = navigationUIController.state.isResizeDisabled !== bool;
    if (!isStateModified) {
      return;
    }

    // Drawer <-- Dock
    if (bool) {
      // // cache state
      // this.sidebarCollapsedCached = navigationUIController.state.isCollapsed;
      // this.sidebarWidthCached = navigationUIController.state.productNavWidth;

      // // clear transition temporary
      // if (this.sidebarCollapsedCached) {
      //   this.addCssClassTemporary('grw-sidebar-supress-transitions-to-drawer');
      // }

      navigationUIController.disableResize();

      // fix width
      navigationUIController.setState({ productNavWidth: sidebarDefaultWidth });
    }
    // Drawer --> Dock
    else {
      // // clear transition temporary
      // if (this.sidebarCollapsedCached) {
      //   this.addCssClassTemporary('grw-sidebar-supress-transitions-to-dock');
      // }

      navigationUIController.enableResize();

      // // restore width
      // if (this.sidebarWidthCached != null) {
      //   navigationUIController.setState({ productNavWidth: this.sidebarWidthCached });
      // }
    }
  }, [navigationUIController]);

  // addCssClassTemporary(className) {
  //   // clear
  //   this.sidebarElem.classList.add(className);

  //   // restore after 300ms
  //   setTimeout(() => {
  //     this.sidebarElem.classList.remove(className);
  //   }, 300);
  // }

  // backdropClickedHandler = () => {
  //   const { navigationContainer } = this.props;
  //   navigationContainer.toggleDrawer();
  // }

  const { isDrawerOpened } = navigationContainer.state;

  return (
    <>
      <div className={`grw-sidebar d-print-none ${isDrawerMode() ? 'grw-sidebar-drawer' : ''} ${isDrawerOpened ? 'open' : ''}`}>
        <ThemeProvider
          theme={theme => ({
            ...theme,
            context: 'product',
          })}
        >
          <LayoutManager
            globalNavigation={GlobalNavigation}
            productNavigation={() => null}
            containerNavigation={SidebarContents}
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

      {/* { isDrawerOpened && (
        <div className="grw-sidebar-backdrop modal-backdrop show" onClick={this.backdropClickedHandler}></div>
      ) } */}
    </>
  );

};


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
