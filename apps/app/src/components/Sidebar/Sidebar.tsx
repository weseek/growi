import React, {
  memo, useCallback, useEffect, useRef, useState,
} from 'react';

import dynamic from 'next/dynamic';

import { useUserUISettings } from '~/client/services/user-ui-settings';
import {
  useDrawerMode, useDrawerOpened,
  useSidebarCollapsed,
  useCurrentSidebarContents,
  useCurrentProductNavWidth,
  useSidebarResizeDisabled,
  useSidebarScrollerRef,
} from '~/stores/ui';

import DrawerToggler from '../Navbar/DrawerToggler';
import { StickyStretchableScrollerProps } from '../StickyStretchableScroller';

import { NavigationResizeHexagon } from './NavigationResizeHexagon';
import { SidebarNav } from './SidebarNav';
import { SidebarSkeleton } from './Skeleton/SidebarSkeleton';

import styles from './Sidebar.module.scss';

const StickyStretchableScroller = dynamic<StickyStretchableScrollerProps>(() => import('../StickyStretchableScroller')
  .then(mod => mod.StickyStretchableScroller), { ssr: false });
const SidebarContents = dynamic(() => import('./SidebarContents')
  .then(mod => mod.SidebarContents), { ssr: false, loading: () => <SidebarSkeleton /> });

const sidebarMinWidth = 240;
const sidebarMinimizeWidth = 20;
const sidebarFixedWidthInDrawerMode = 320;

const GlobalNavigation = memo(() => {
  const { data: isDrawerMode } = useDrawerMode();
  const { data: currentContents } = useCurrentSidebarContents();
  const { data: isCollapsed, mutate: mutateSidebarCollapsed } = useSidebarCollapsed();

  const { scheduleToPut } = useUserUISettings();

  const itemSelectedHandler = useCallback((selectedContents) => {
    if (isDrawerMode) {
      return;
    }

    let newValue = false;

    // already selected
    if (currentContents === selectedContents) {
      // toggle collapsed
      newValue = !isCollapsed;
    }

    mutateSidebarCollapsed(newValue, false);
    scheduleToPut({ isSidebarCollapsed: newValue });

  }, [currentContents, isCollapsed, isDrawerMode, mutateSidebarCollapsed, scheduleToPut]);

  return <SidebarNav onItemSelected={itemSelectedHandler} />;

});
GlobalNavigation.displayName = 'GlobalNavigation';

const SidebarContentsWrapper = memo(() => {
  const { mutate: mutateSidebarScroller } = useSidebarScrollerRef();

  const calcViewHeight = useCallback(() => {
    const elem = document.querySelector('#grw-sidebar-contents-wrapper');
    return elem != null
      ? window.innerHeight - elem?.getBoundingClientRect().top
      : window.innerHeight;
  }, []);

  return (
    <>
      <div id="grw-sidebar-contents-wrapper" style={{ minHeight: '100%' }}>
        <StickyStretchableScroller
          simplebarRef={mutateSidebarScroller}
          stickyElemSelector=".grw-sidebar"
          calcViewHeight={calcViewHeight}
        >
          <SidebarContents />
        </StickyStretchableScroller>
      </div>

      <DrawerToggler iconClass="icon-arrow-left" />
    </>
  );
});
SidebarContentsWrapper.displayName = 'SidebarContentsWrapper';


export const Sidebar = memo((): JSX.Element => {

  const { data: isDrawerMode } = useDrawerMode();
  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: currentProductNavWidth, mutate: mutateProductNavWidth } = useCurrentProductNavWidth();
  const { data: isCollapsed, mutate: mutateSidebarCollapsed } = useSidebarCollapsed();
  const { data: isResizeDisabled, mutate: mutateSidebarResizeDisabled } = useSidebarResizeDisabled();

  const { scheduleToPut } = useUserUISettings();

  const [isHover, setHover] = useState(false);
  const [isHoverOnResizableContainer, setHoverOnResizableContainer] = useState(false);
  const [isDragging, setDrag] = useState(false);

  const resizableContainer = useRef<HTMLDivElement>(null);

  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const isResizableByDrag = !isResizeDisabled && !isDrawerMode && (!isCollapsed || isHover);

  const toggleDrawerMode = useCallback((bool) => {
    const isStateModified = isResizeDisabled !== bool;
    if (!isStateModified) {
      return;
    }

    // Drawer <-- Dock
    if (bool) {
      // disable resize
      mutateSidebarResizeDisabled(true, false);
    }
    // Drawer --> Dock
    else {
      // enable resize
      mutateSidebarResizeDisabled(false, false);
    }
  }, [isResizeDisabled, mutateSidebarResizeDisabled]);

  const backdropClickedHandler = useCallback(() => {
    mutateDrawerOpened(false, false);
  }, [mutateDrawerOpened]);


  const setContentWidth = useCallback((newWidth: number) => {
    if (resizableContainer.current == null) {
      return;
    }
    resizableContainer.current.style.width = `${newWidth}px`;
  }, []);

  const hoverOnHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHover(true);
  }, [isCollapsed, isDragging, isDrawerMode]);

  const hoverOutHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHover(false);
  }, [isCollapsed, isDragging, isDrawerMode]);

  const hoverOnResizableContainerHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHoverOnResizableContainer(true);
  }, [isCollapsed, isDrawerMode, isDragging]);

  const hoverOutResizableContainerHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHoverOnResizableContainer(false);
  }, [isCollapsed, isDrawerMode, isDragging]);

  const toggleNavigationBtnClickHandler = useCallback(() => {
    const newValue = !isCollapsed;
    mutateSidebarCollapsed(newValue, false);
    scheduleToPut({ isSidebarCollapsed: newValue });
  }, [isCollapsed, mutateSidebarCollapsed, scheduleToPut]);

  useEffect(() => {
    if (isCollapsed) {
      setContentWidth(sidebarMinimizeWidth);
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setContentWidth(currentProductNavWidth!);
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
      scheduleToPut({ isSidebarCollapsed: true, currentProductNavWidth: sidebarMinWidth });
    }
    else {
      const newWidth = resizableContainer.current.clientWidth;
      mutateSidebarCollapsed(false);
      mutateProductNavWidth(newWidth, false);
      scheduleToPut({ isSidebarCollapsed: false, currentProductNavWidth: newWidth });
    }

    resizableContainer.current.classList.remove('dragging');

  }, [mutateProductNavWidth, mutateSidebarCollapsed, scheduleToPut]);

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

  useEffect(() => {
    toggleDrawerMode(isDrawerMode);
  }, [isDrawerMode, toggleDrawerMode]);

  // open/close resizable container
  useEffect(() => {
    if (!isCollapsed) {
      return;
    }

    if (isHoverOnResizableContainer) {
      // schedule to open
      timeoutIdRef.current = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setContentWidth(currentProductNavWidth!);
      }, 70);
    }
    else if (timeoutIdRef.current != null) {
      // cancel schedule to open
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = undefined;
    }

    // close
    if (!isHover) {
      setContentWidth(sidebarMinimizeWidth);
      timeoutIdRef.current = undefined;
    }
  }, [isCollapsed, isHover, isHoverOnResizableContainer, currentProductNavWidth, setContentWidth]);

  // open/close resizable container when drawer mode
  useEffect(() => {
    if (isDrawerMode) {
      setContentWidth(sidebarFixedWidthInDrawerMode);
    }
    else if (isCollapsed) {
      setContentWidth(sidebarMinimizeWidth);
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setContentWidth(currentProductNavWidth!);
    }
  }, [currentProductNavWidth, isCollapsed, isDrawerMode, setContentWidth]);


  const showContents = isDrawerMode || isHover || !isCollapsed;


  // css styles
  const grwSidebarClass = `grw-sidebar ${styles['grw-sidebar']}`;
  const sidebarModeClass = `${isDrawerMode ? 'grw-sidebar-drawer' : 'grw-sidebar-dock'}`;
  const isOpenClass = `${isDrawerOpened ? 'open' : ''}`;
  return (
    <>
      <div className={`${grwSidebarClass} ${sidebarModeClass} ${isOpenClass} d-print-none`} data-testid="grw-sidebar">
        <div className="data-layout-container">
          <div
            className='navigation transition-enabled'
            onMouseEnter={hoverOnHandler}
            onMouseLeave={hoverOutHandler}
          >
            <div className="grw-navigation-wrap">
              <div className="grw-global-navigation">
                <GlobalNavigation></GlobalNavigation>
              </div>
              <div
                ref={resizableContainer}
                className="grw-contextual-navigation"
                onMouseEnter={hoverOnResizableContainerHandler}
                onMouseLeave={hoverOutResizableContainerHandler}
                style={{ width: isCollapsed ? sidebarMinimizeWidth : currentProductNavWidth }}
              >
                <div className="grw-contextual-navigation-child">
                  <div role="group" data-testid="grw-contextual-navigation-sub" className={`grw-contextual-navigation-sub ${showContents ? '' : 'd-none'}`}>
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
                data-testid="grw-navigation-resize-button"
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
        <div className={`${styles['grw-sidebar-backdrop']} modal-backdrop show`} onClick={backdropClickedHandler}></div>
      ) }
    </>
  );

});
Sidebar.displayName = 'Sidebar';
