import React, {
  memo, useCallback, useEffect, useRef,
} from 'react';

import dynamic from 'next/dynamic';

import { useUserUISettings } from '~/client/services/user-ui-settings';
import {
  useDrawerMode, useDrawerOpened,
  useSidebarCollapsed,
  useCurrentProductNavWidth,
  useSidebarResizeDisabled,
} from '~/stores/ui';

import { SidebarNav } from './SidebarNav';

import styles from './Sidebar.module.scss';


const SidebarContents = dynamic(() => import('./SidebarContents').then(mod => mod.SidebarContents), { ssr: false });


const sidebarNavWidth = 48;
const sidebarMinWidth = 240;
const sidebarMinimizeWidth = 0;
const sidebarFixedWidthInDrawerMode = 320;


export const SidebarSubstance = memo((): JSX.Element => {

  const { data: isDrawerMode } = useDrawerMode();
  const { data: currentProductNavWidth, mutate: mutateProductNavWidth } = useCurrentProductNavWidth();
  const { data: isCollapsed, mutate: mutateSidebarCollapsed } = useSidebarCollapsed();
  const { data: isResizeDisabled, mutate: mutateSidebarResizeDisabled } = useSidebarResizeDisabled();

  const { scheduleToPut } = useUserUISettings();

  const resizableContainer = useRef<HTMLDivElement>(null);

  const isResizableByDrag = !isResizeDisabled && !isDrawerMode && !isCollapsed;

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

  const setContentWidth = useCallback((newWidth: number) => {
    if (resizableContainer.current == null) {
      return;
    }
    resizableContainer.current.style.width = `${newWidth}px`;
  }, []);

  const draggableAreaMoveHandler = useCallback((event: MouseEvent) => {
    event.preventDefault();

    const newWidth = event.pageX - sidebarNavWidth;
    if (resizableContainer.current != null) {
      setContentWidth(newWidth);
      resizableContainer.current.classList.add('dragging');
    }
  }, [setContentWidth]);

  const dragableAreaMouseUpHandler = useCallback(() => {
    if (resizableContainer.current == null) {
      return;
    }

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


  const showContents = isDrawerMode || !isCollapsed;

  return (
    <div className="data-layout-container">
      <div className="navigation transition-enabled">
        <div className="grw-navigation-wrap">
          <SidebarNav />
          <div
            ref={resizableContainer}
            className="grw-contextual-navigation"
            style={{ width: isCollapsed ? sidebarMinimizeWidth : currentProductNavWidth }}
          >
            <div className={`grw-contextual-navigation-child ${showContents ? '' : 'd-none'}`} data-testid="grw-contextual-navigation-child">
              <SidebarContents />
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
          </div>
        </div>
      </div>
    </div>
  );

});

export const Sidebar = (): JSX.Element => {

  const { data: isDrawerMode } = useDrawerMode();
  const { data: isDrawerOpened } = useDrawerOpened();

  // css styles
  const grwSidebarClass = `grw-sidebar ${styles['grw-sidebar']}`;
  const sidebarModeClass = `${isDrawerMode ? 'grw-sidebar-drawer' : 'grw-sidebar-dock'}`;
  const isOpenClass = `${isDrawerOpened ? 'open' : ''}`;

  return (
    <div className={`${grwSidebarClass} ${sidebarModeClass} ${isOpenClass} d-print-none`} data-testid="grw-sidebar">
      <SidebarSubstance />
    </div>
  );
};
