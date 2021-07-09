import dynamic from 'next/dynamic';
import React, { useCallback, useEffect } from 'react';

import {
  withNavigationUIController,
  NavigationProvider,
  ThemeProvider,
} from '@atlaskit/navigation-next';

import {
  useCurrentSidebarContents, useDrawerMode, useDrawerOpened, usePreferDrawerModeByUser,
} from '~/stores/ui';

import SidebarNav from './Sidebar/SidebarNav';

const sidebarDefaultWidth = 320;


type GlobalNavigationProps = {
  navigationUIController: any, // UIController from @atlaskit/navigation-next
}

const GlobalNavigation = withNavigationUIController((props: GlobalNavigationProps): JSX.Element => {
  const { data: currentContents } = useCurrentSidebarContents();

  const { navigationUIController } = props;

  const itemSelectedHandler = useCallback((selectedContents) => {

    // already selected
    if (currentContents === selectedContents) {
      navigationUIController.toggleCollapse();
    }
    // switch and expand
    else {
      navigationUIController.expand();
    }
  }, [currentContents, navigationUIController]);

  return <SidebarNav onItemSelected={itemSelectedHandler} />;
});


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
  navigationUIController: any,
}

const Sidebar = (props: Props) => {

  const { data: isDrawerMode } = useDrawerMode();
  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();

  const { navigationUIController } = props;

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

  const backdropClickedHandler = useCallback(() => {
    mutateDrawerOpened(false);
  }, [mutateDrawerOpened]);

  useEffect(() => {
    // this.hackUIController();
  }, []);

  useEffect(() => {
    toggleDrawerMode(isDrawerMode);
  }, [isDrawerMode, toggleDrawerMode]);

  const toggleNavigationBtnClickHandler = useCallback(() => {
    navigationUIController.toggleCollapse();
  }, [navigationUIController]);

  return (
    <>
      <div className={`grw-sidebar d-print-none ${isDrawerMode ? 'grw-sidebar-drawer' : ''} ${isDrawerOpened ? 'open' : ''}`}>
        <ThemeProvider
          theme={theme => ({
            ...theme,
            context: 'product',
          })}
        >
          <div className="data-layout-container">
            <div className="navigation">
              <div className="grw-navigation-wrap">
                <div className="grw-global-navigation">
                  <GlobalNavigation></GlobalNavigation>
                </div>
                <div className="grw-contextual-navigation">
                  <div>
                    <div role="group" className="grw-contextual-navigation-sub"></div>
                  </div>
                  <div>
                    <div role="group" className="grw-contextual-navigation-sub">
                      <div className="SlimScrollDiv">
                        <SidebarContents></SidebarContents>
                      </div>
                      <div className="slimScrollBar"></div>
                      <div className="slimScrollRail"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grw-navigation-draggable">
                <div className="grw-navigation-draggable-sub"></div>
                <div className="grw-navigation-draggable-hitarea">
                  <div className="grw-navigation-draggable-hitarea-child"></div>
                </div>
                <div>
                  <div>
                    <button
                      className="ak-navigation-resize-button css-889cso"
                      type="button"
                      aria-expanded="true"
                      aria-label="Toggle navigation"
                      onClick={toggleNavigationBtnClickHandler}
                    >
                      <div className="css-z8pkji"></div>
                      <span role="presentation" className="sc-AxjAm jMDUxe"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <LayoutManager
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
          </LayoutManager> */}
        </ThemeProvider>
      </div>

      { isDrawerOpened && (
        <div className="grw-sidebar-backdrop modal-backdrop show" onClick={backdropClickedHandler}></div>
      ) }
    </>
  );

};


const SidebarWithNavigationUIController = withNavigationUIController(Sidebar);

/**
 * Wrapper component for using unstated
 */

const SidebarWithNavigation = (props) => {
  // const { preferDrawerModeByUser: isDrawerModeOnInit } = props.navigationContainer.state;
  const { data: preferDrawerModeByUser } = usePreferDrawerModeByUser();

  const initUICForDrawerMode = preferDrawerModeByUser
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
      <SidebarWithNavigationUIController {...props} />
    </NavigationProvider>
  );
};

export default SidebarWithNavigation;
