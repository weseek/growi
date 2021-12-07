import React, {
  FC, useCallback, useEffect, useRef, useState,
} from 'react';

import { scheduleToPutUserUISettings } from '~/client/services/user-ui-settings';
import {
  useDrawerMode, useDrawerOpened,
  useSidebarCollapsed,
  useCurrentSidebarContents,
  useCurrentProductNavWidth,
  useSidebarResizeDisabled,
} from '~/stores/ui';

import DrawerToggler from './Navbar/DrawerToggler';

import SidebarNav from './Sidebar/SidebarNav';
import SidebarContents from './Sidebar/SidebarContents';
import { NavigationResizeHexagon } from './Sidebar/NavigationResizeHexagon';
import StickyStretchableScroller from './StickyStretchableScroller';

const sidebarMinWidth = 240;
const sidebarMinimizeWidth = 20;

const GlobalNavigation = () => {
  const { data: currentContents } = useCurrentSidebarContents();
  const { data: isCollapsed, mutate: mutateSidebarCollapsed } = useSidebarCollapsed();

  const itemSelectedHandler = useCallback((selectedContents) => {

    let newValue = false;

    // already selected
    if (currentContents === selectedContents) {
      // toggle collapsed
      newValue = !isCollapsed;
    }

    mutateSidebarCollapsed(newValue, false);
    scheduleToPutUserUISettings({ isSidebarCollapsed: newValue });

  }, [currentContents, isCollapsed, mutateSidebarCollapsed]);

  return <SidebarNav onItemSelected={itemSelectedHandler} />;
};

const SidebarContentsWrapper = () => {
  const { data: currentContents } = useCurrentSidebarContents();

  const scrollTargetSelector = '#grw-sidebar-contents-scroll-target';

  const calcViewHeight = useCallback(() => {
    const scrollTargetElem = document.querySelector('#grw-sidebar-contents-scroll-target');
    return scrollTargetElem != null
      ? window.innerHeight - scrollTargetElem?.getBoundingClientRect().top
      : window.innerHeight;
  }, []);

  return (
    <>
      <StickyStretchableScroller
        scrollTargetSelector={scrollTargetSelector}
        contentsElemSelector="#grw-sidebar-content-container"
        stickyElemSelector=".grw-sidebar"
        calcViewHeightFunc={calcViewHeight}
        resetKey={currentContents}
      />

      <div id="grw-sidebar-contents-scroll-target">
        <div id="grw-sidebar-content-container">
          <SidebarContents />
        </div>
      </div>

      <DrawerToggler iconClass="icon-arrow-left" />
    </>
  );
};


type Props = {
}

const Sidebar: FC<Props> = (props: Props) => {
  const { data: isDrawerMode } = useDrawerMode();
  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: currentProductNavWidth, mutate: mutateProductNavWidth } = useCurrentProductNavWidth();
  const { data: isCollapsed, mutate: mutateSidebarCollapsed } = useSidebarCollapsed();
  const { data: isResizeDisabled, mutate: mutateSidebarResizeDisabled } = useSidebarResizeDisabled();

  const [isHover, setHover] = useState(false);
  const [isDragging, setDrag] = useState(false);

  const isResizableByDrag = !isResizeDisabled && !isDrawerMode && (!isCollapsed || isHover);
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
    const isStateModified = isResizeDisabled !== bool;
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

      // disable resize
      mutateSidebarResizeDisabled(true, false);
    }
    // Drawer --> Dock
    else {
      // // clear transition temporary
      // if (this.sidebarCollapsedCached) {
      //   this.addCssClassTemporary('grw-sidebar-supress-transitions-to-dock');
      // }

      // enable resize
      mutateSidebarResizeDisabled(false, false);

      // // restore width
      // if (this.sidebarWidthCached != null) {
      //   navigationUIController.setState({ productNavWidth: this.sidebarWidthCached });
      // }
    }
  }, [isResizeDisabled, mutateSidebarResizeDisabled]);

  // addCssClassTemporary(className) {
  //   // clear
  //   this.sidebarElem.classList.add(className);

  //   // restore after 300ms
  //   setTimeout(() => {
  //     this.sidebarElem.classList.remove(className);
  //   }, 300);
  // }

  const backdropClickedHandler = useCallback(() => {
    mutateDrawerOpened(false, false);
  }, [mutateDrawerOpened]);

  useEffect(() => {
    // this.hackUIController();
    // setMounted(true);
  }, []);

  useEffect(() => {
    toggleDrawerMode(isDrawerMode);
  }, [isDrawerMode, toggleDrawerMode]);

  const resizableContainer = useRef<HTMLDivElement>(null);
  const setContentWidth = useCallback((newWidth) => {
    if (resizableContainer.current == null) {
      return;
    }
    resizableContainer.current.style.width = `${newWidth}px`;
  }, []);

  const hoverOnResizableContainerHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHover(true);
    setContentWidth(currentProductNavWidth);
  }, [isCollapsed, isDrawerMode, isDragging, setContentWidth, currentProductNavWidth]);

  const hoverOutHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHover(false);
    setContentWidth(sidebarMinimizeWidth);
  }, [isCollapsed, isDragging, isDrawerMode, setContentWidth]);

  const toggleNavigationBtnClickHandler = useCallback(() => {
    const newValue = !isCollapsed;
    mutateSidebarCollapsed(newValue, false);
    scheduleToPutUserUISettings({ isSidebarCollapsed: newValue });
  }, [isCollapsed, mutateSidebarCollapsed]);

  useEffect(() => {
    if (isCollapsed) {
      setContentWidth(sidebarMinimizeWidth);
    }
    else {
      setContentWidth(currentProductNavWidth);
    }
  }, [currentProductNavWidth, isCollapsed, setContentWidth]);

  const draggableAreaMoveHandler = useCallback((event: MouseEvent) => {
    event.preventDefault();

    const newWidth = event.pageX - 60;
    if (resizableContainer.current != null) {
      setContentWidth(newWidth);
      resizableContainer.current.classList.add('dragging');
    }
  }, [setContentWidth]);

  const dragableAreaMouseUpHandler = useCallback(() => {
    if (resizableContainer.current == null) {
      return;
    }

    setDrag(false);

    if (resizableContainer.current.clientWidth < sidebarMinWidth) {
      // force collapsed
      mutateSidebarCollapsed(true);
      mutateProductNavWidth(sidebarMinWidth, false);
      scheduleToPutUserUISettings({ isSidebarCollapsed: true, currentProductNavWidth: sidebarMinWidth });
    }
    else {
      const newWidth = resizableContainer.current.clientWidth;
      mutateSidebarCollapsed(false);
      mutateProductNavWidth(newWidth, false);
      scheduleToPutUserUISettings({ isSidebarCollapsed: false, currentProductNavWidth: newWidth });
    }

    resizableContainer.current.classList.remove('dragging');

  }, [mutateProductNavWidth, mutateSidebarCollapsed]);

  const dragableAreaMouseDownHandler = useCallback((event: React.MouseEvent) => {
    if (!isResizableByDrag) {
      return;
    }

    event.preventDefault();

    setDrag(true);

    const removeEventListeners = () => {
      document.removeEventListener('mousemove', draggableAreaMoveHandler);
      document.removeEventListener('mouseup', dragableAreaMouseUpHandler);
      document.removeEventListener('mouseup', removeEventListeners);
    };

    document.addEventListener('mousemove', draggableAreaMoveHandler);
    document.addEventListener('mouseup', dragableAreaMouseUpHandler);
    document.addEventListener('mouseup', removeEventListeners);

  }, [dragableAreaMouseUpHandler, draggableAreaMoveHandler, isResizableByDrag]);

  return (
    <>
      <div className={`grw-sidebar d-print-none ${isDrawerMode ? 'grw-sidebar-drawer' : ''} ${isDrawerOpened ? 'open' : ''}`}>
        <div className="data-layout-container">
          <div className="navigation" onMouseLeave={hoverOutHandler}>
            <div className="grw-navigation-wrap">
              <div className="grw-global-navigation">
                <GlobalNavigation></GlobalNavigation>
              </div>
              <div
                ref={resizableContainer}
                className="grw-contextual-navigation"
                onMouseEnter={hoverOnResizableContainerHandler}
                style={{ width: isCollapsed ? sidebarMinimizeWidth : currentProductNavWidth }}
              >
                <div className="grw-contextual-navigation-child">
                  <div role="group" className={`grw-contextual-navigation-sub ${!isHover && isCollapsed ? 'collapsed' : ''}`}>
                    <SidebarContentsWrapper></SidebarContentsWrapper>
                  </div>
                </div>
              </div>
            </div>
            <div className="grw-navigation-draggable">
              { isResizableByDrag && (
                <div
                  className="grw-navigation-draggable-hitarea"
                  onMouseDown={dragableAreaMouseDownHandler}
                >
                  <div className="grw-navigation-draggable-hitarea-child"></div>
                </div>
              ) }
              <button
                className={`grw-navigation-resize-button ${!isDrawerMode ? 'resizable' : ''} ${isCollapsed ? 'collapsed' : ''} `}
                type="button"
                aria-expanded="true"
                aria-label="Toggle navigation"
                disabled={isDrawerMode}
                onClick={toggleNavigationBtnClickHandler}
              >
                <span className="hexagon-container" role="presentation">
                  <NavigationResizeHexagon />
                </span>
                <span className="hitarea" role="presentation"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      { isDrawerOpened && (
        <div className="grw-sidebar-backdrop modal-backdrop show" onClick={backdropClickedHandler}></div>
      ) }
    </>
  );

};

export default Sidebar;
