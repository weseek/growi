import React, {
  memo, useCallback, useEffect, useState,
} from 'react';

import dynamic from 'next/dynamic';

import { scheduleToPut } from '~/client/services/user-ui-settings';
import {
  useDrawerMode, useDrawerOpened,
  useCollapsedMode, useCollapsedContentsOpened,
  useCurrentProductNavWidth,
  useSidebarResizeDisabled,
} from '~/stores/ui';

import { ResizableArea } from './ResizableArea/ResizableArea';
import { SidebarHead } from './SidebarHead';
import { SidebarNav } from './SidebarNav';

import styles from './Sidebar.module.scss';


const SidebarContents = dynamic(() => import('./SidebarContents').then(mod => mod.SidebarContents), { ssr: false });


const resizableAreaMinWidth = 348;
const resizableAreaCollapsedWidth = 48;


export const SidebarSubstance = memo((): JSX.Element => {

  const { data: isDrawerMode } = useDrawerMode();
  const { data: currentProductNavWidth, mutate: mutateProductNavWidth } = useCurrentProductNavWidth();
  const { data: isCollapsedMode, mutate: mutateCollapsedMode } = useCollapsedMode();
  const { mutate: mutateCollapsedContentsOpened } = useCollapsedContentsOpened();
  const { data: isResizeDisabled, mutate: mutateSidebarResizeDisabled } = useSidebarResizeDisabled();

  const [resizableAreaWidth, setResizableAreaWidth] = useState<number|undefined>(undefined);

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
    mutateCollapsedMode(true);
    mutateCollapsedContentsOpened(false);
    scheduleToPut({ preferCollapsedModeByUser: true });
  }, [mutateCollapsedContentsOpened, mutateCollapsedMode]);

  useEffect(() => {
    toggleDrawerMode(isDrawerMode);
  }, [isDrawerMode, toggleDrawerMode]);

  // open/close resizable container when drawer mode
  useEffect(() => {
    if (isDrawerMode) {
      setResizableAreaWidth(undefined);
    }
    else if (isCollapsedMode) {
      setResizableAreaWidth(resizableAreaCollapsedWidth);
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setResizableAreaWidth(currentProductNavWidth!);
    }
  }, [currentProductNavWidth, isCollapsedMode, isDrawerMode]);

  const disableResizing = isResizeDisabled || isDrawerMode || isCollapsedMode;

  return (
    <ResizableArea
      width={resizableAreaWidth}
      minWidth={resizableAreaMinWidth}
      disabled={disableResizing}
      onResize={resizeHandler}
      onResizeDone={resizeDoneHandler}
      onCollapsed={collapsedByResizableAreaHandler}
    >
      <SidebarHead />
      <div className="grw-sidebar-inner d-flex flex-row h-100">
        <SidebarNav />
        <div className="sidebar-contents-container flex-grow-1 overflow-y-auto">
          <SidebarContents />
        </div>
      </div>
    </ResizableArea>
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
    <div className={`${grwSidebarClass} ${sidebarModeClass} ${isOpenClass} vh-100`} data-testid="grw-sidebar">
      <SidebarSubstance />
    </div>
  );
};
