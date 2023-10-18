import React, {
  memo, useCallback, useEffect, useState,
} from 'react';

import dynamic from 'next/dynamic';

import { scheduleToPut } from '~/client/services/user-ui-settings';
import {
  useDrawerMode, useDrawerOpened,
  useSidebarCollapsed,
  useCurrentProductNavWidth,
  useSidebarResizeDisabled,
} from '~/stores/ui';

import { ResizableArea } from './ResizableArea/ResizableArea';
import { SidebarNav } from './SidebarNav';

import styles from './Sidebar.module.scss';


const SidebarContents = dynamic(() => import('./SidebarContents').then(mod => mod.SidebarContents), { ssr: false });


const sidebarMinWidth = 240;
const sidebarCollapsedWidth = 0;
const sidebarFixedWidthInDrawerMode = 320;


export const SidebarSubstance = memo((): JSX.Element => {

  const { data: isDrawerMode } = useDrawerMode();
  const { data: currentProductNavWidth, mutate: mutateProductNavWidth } = useCurrentProductNavWidth();
  const { data: isCollapsed, mutate: mutateSidebarCollapsed } = useSidebarCollapsed();
  const { data: isResizeDisabled, mutate: mutateSidebarResizeDisabled } = useSidebarResizeDisabled();

  const [resizableAreaWidth, setResizableAreaWidth] = useState(0);

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

  const resizeHandler = useCallback((newWidth: number) => {
    setResizableAreaWidth(newWidth);
  }, []);

  const resizeDoneHandler = useCallback((newWidth: number) => {
    mutateProductNavWidth(newWidth, false);
    scheduleToPut({ preferCollapsedModeByUser: false, currentProductNavWidth: newWidth });
  }, [mutateProductNavWidth]);

  const collapsedByResizableAreaHandler = useCallback(() => {
    mutateSidebarCollapsed(true);
    mutateProductNavWidth(sidebarMinWidth, false);
    scheduleToPut({ preferCollapsedModeByUser: true, currentProductNavWidth: sidebarMinWidth });
  }, [mutateProductNavWidth, mutateSidebarCollapsed]);

  useEffect(() => {
    toggleDrawerMode(isDrawerMode);
  }, [isDrawerMode, toggleDrawerMode]);

  // open/close resizable container when drawer mode
  useEffect(() => {
    if (isDrawerMode) {
      setResizableAreaWidth(sidebarFixedWidthInDrawerMode);
    }
    else if (isCollapsed) {
      setResizableAreaWidth(sidebarCollapsedWidth);
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setResizableAreaWidth(currentProductNavWidth!);
    }
  }, [currentProductNavWidth, isCollapsed, isDrawerMode]);

  const disableResizing = isResizeDisabled || isDrawerMode || isCollapsed;

  return (
    <div className="grw-navigation-wrap">
      <SidebarNav />
      <ResizableArea
        width={resizableAreaWidth}
        minWidth={sidebarMinWidth}
        disabled={disableResizing}
        onResize={resizeHandler}
        onResizeDone={resizeDoneHandler}
        onCollapsed={collapsedByResizableAreaHandler}
      >
        <div className="sidebar-contents-container">
          <SidebarContents />
        </div>
      </ResizableArea>
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
