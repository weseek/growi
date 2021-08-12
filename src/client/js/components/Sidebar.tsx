import dynamic from 'next/dynamic';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import {
  withNavigationUIController,
  NavigationProvider,
  ThemeProvider,
} from '@atlaskit/navigation-next';

import {
  useCurrentSidebarContents, useDrawerMode, useDrawerOpened, usePreferDrawerModeByUser, useCurrentProductNavWidth,
} from '~/stores/ui';

import SidebarNav from './Sidebar/SidebarNav';

const sidebarMinWidth = 240;
const sidebarMinimizeWidth = 20;

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

// dummy skelton contents
const SidebarSkeltonContents = (props: Props) => {
  return (
      <div>Skelton Contents!!!</div>
  );
};



type Props = {
  navigationUIController: any,
  productNavWidth: number
}

const Sidebar = (props: Props) => {

  // TODO get CurrentProductNavWidth
  const { navigationUIController, productNavWidth } = props;

  const { data: isDrawerMode } = useDrawerMode();
  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: currentProductNavWidth, mutate: mutateProductNavWidth } = useCurrentProductNavWidth(productNavWidth);

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

  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    // this.hackUIController();
    setMounted(true);
  }, []);

  useEffect(() => {
    toggleDrawerMode(isDrawerMode);
  }, [isDrawerMode, toggleDrawerMode]);

  const [isHover, setHover] = useState(false);
  const [isDragging, setDrag] = useState(false);

  const resizableContainer = useRef<HTMLDivElement>(null);
  const setContentWidth = useCallback((newWidth) => {
    if (resizableContainer.current == null) {
      return;
    }
    resizableContainer.current.style.width = `${newWidth}px`;
  }, []);

  const hoverHandler = useCallback((isHover: boolean) => {
    if (!navigationUIController.state.isCollapsed || isDrawerMode) {
      return;
    }

    setHover(isHover);

    if (isHover) {
      setContentWidth(currentProductNavWidth);
    }
    if (!isHover) {
      setContentWidth(sidebarMinimizeWidth);
    }
  }, [navigationUIController.state.isCollapsed, isDrawerMode, currentProductNavWidth]);

  const toggleNavigationBtnClickHandler = useCallback(() => {
    navigationUIController.toggleCollapse();
  }, [navigationUIController]);

  useEffect(() => {
    if (navigationUIController.state.isCollapsed) {
      setContentWidth(sidebarMinimizeWidth);
    }
    else {
      setContentWidth(currentProductNavWidth);
    }
  }, [navigationUIController.state.isCollapsed]);

  const draggableAreaMoveHandler = useCallback((event) => {
    if (isDragging) {
      event.preventDefault();
      const newWidth = event.pageX - 60;
      if (resizableContainer.current != null) {
        setContentWidth(newWidth);
        resizableContainer.current.classList.add('dragging');
      }
    }
  }, [isDragging]);

  const dragableAreaMouseUpHandler = useCallback(() => {
    if (resizableContainer.current == null) {
      return;
    }

    setDrag(false);

    if (resizableContainer.current.clientWidth < sidebarMinWidth) {
      navigationUIController.collapse();
      mutateProductNavWidth(sidebarMinWidth);
      // TODO call API and save DB
    }
    else {
      mutateProductNavWidth(resizableContainer.current.clientWidth);
      // TODO call API and save DB
    }

    resizableContainer.current.classList.remove('dragging');

    document.removeEventListener('mousemove', draggableAreaMoveHandler);
    document.removeEventListener('mouseup', dragableAreaMouseUpHandler);

  }, [navigationUIController, draggableAreaMoveHandler]);

  const dragableAreaClickHandler = useCallback(() => {
    if (navigationUIController.state.isCollapsed || isDrawerMode) {
      return;
    }
    setDrag(true);
  }, [navigationUIController.state.isCollapsed, isDrawerMode]);

  useEffect(() => {
    document.addEventListener('mousemove', draggableAreaMoveHandler);
    document.addEventListener('mouseup', dragableAreaMouseUpHandler);
  }, [draggableAreaMoveHandler, dragableAreaMouseUpHandler]);

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
                <div
                  ref={resizableContainer}
                  className="grw-contextual-navigation"
                  onMouseEnter={() => hoverHandler(true)}
                  onMouseLeave={() => hoverHandler(false)}
                  onMouseMove={draggableAreaMoveHandler}
                  onMouseUp={dragableAreaMouseUpHandler}
                  style={{ width: navigationUIController.state.isCollapsed ? sidebarMinimizeWidth : currentProductNavWidth }}
                >
                  <div className="grw-contextual-navigation-child">
                    <div role="group" className="grw-contextual-navigation-sub"></div>
                  </div>
                  <div className="grw-contextual-navigation-child2">
                    <div role="group" className={`grw-contextual-navigation-sub ${!isHover && navigationUIController.state.isCollapsed ? 'collapsed' : ''}`}>
                    { isMounted ? <SidebarContents></SidebarContents> : <SidebarSkeltonContents {...props} /> }
                    </div>
                  </div>
                </div>
              </div>
              <div className="grw-navigation-draggable">
                <div className="grw-navigation-draggable-sub"></div>
                <div
                  className={`${!isDrawerMode ? 'resizable' : ''} grw-navigation-draggable-hitarea`}
                  onMouseDown={dragableAreaClickHandler}
                >
                  <div className="grw-navigation-draggable-hitarea-child"></div>
                </div>
                <div>
                  <div>
                    <button
                      className={`ak-navigation-resize-button ${!isDrawerMode ? 'resizable' : ''} ${navigationUIController.state.isCollapsed ? 'collapse-state' : 'normal-state'} `}
                      type="button"
                      aria-expanded="true"
                      aria-label="Toggle navigation"
                      disabled={isDrawerMode}
                      onClick={toggleNavigationBtnClickHandler}
                    >
                      <div className="css-z8pkji"></div>
                      <span role="presentation" className="sc-AxjAm jMDUxe">
                        <svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation">
                          <path
                            d="M13.706 9.698a.988.988 0 0 0 0-1.407
                            1.01 1.01 0 0 0-1.419 0l-2.965 2.94a1.09 1.09 0 0 0 0 1.548l2.955
                            2.93a1.01 1.01 0 0 0 1.42 0 .988.988 0 0 0 0-1.407l-2.318-2.297 2.327-2.307z"
                            fill="currentColor"
                            fillRule="evenodd"
                          >
                          </path>
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      productNavWidth: props.productNavWidth,
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
