import React, {
  type FC,
  memo, useCallback, useEffect, useState,
} from 'react';

import dynamic from 'next/dynamic';

import { scheduleToPut } from '~/client/services/user-ui-settings';
import {
  useDrawerMode, useDrawerOpened,
  useCollapsedMode, useCollapsedContentsOpened,
  useCurrentProductNavWidth,
} from '~/stores/ui';

import { ResizableArea } from './ResizableArea/ResizableArea';
import { SidebarHead } from './SidebarHead';
import { SidebarNav, type SidebarNavProps } from './SidebarNav';

import styles from './Sidebar.module.scss';


const SidebarContents = dynamic(() => import('./SidebarContents').then(mod => mod.SidebarContents), { ssr: false });


const resizableAreaMinWidth = 348;
const resizableAreaCollapsedWidth = 48;


type ResizableContainerProps = {
  children?: React.ReactNode,
}

const ResizableContainer = memo((props: ResizableContainerProps): JSX.Element => {

  const { children } = props;

  const { data: isDrawerMode } = useDrawerMode();
  const { data: currentProductNavWidth, mutate: mutateProductNavWidth } = useCurrentProductNavWidth();
  const { data: isCollapsedMode, mutate: mutateCollapsedMode } = useCollapsedMode();
  const { mutate: mutateCollapsedContentsOpened } = useCollapsedContentsOpened();

  const [isResizeDisabled, setResizeDisabled] = useState(false);
  const [resizableAreaWidth, setResizableAreaWidth] = useState<number|undefined>(undefined);

  const toggleDrawerMode = useCallback((bool) => {
    const isStateModified = isResizeDisabled !== bool;
    if (!isStateModified) {
      return;
    }

    // Drawer <-- Dock
    if (bool) {
      // disable resize
      setResizeDisabled(true);
    }
    // Drawer --> Dock
    else {
      // enable resize
      setResizeDisabled(false);
    }
  }, [isResizeDisabled]);

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
      className="flex-expand-vert"
      width={resizableAreaWidth}
      minWidth={resizableAreaMinWidth}
      disabled={disableResizing}
      onResize={resizeHandler}
      onResizeDone={resizeDoneHandler}
      onCollapsed={collapsedByResizableAreaHandler}
    >
      {children}
    </ResizableArea>
  );

});


type CollapsibleContainerProps = {
  Nav: FC<SidebarNavProps>,
  className?: string,
  children?: React.ReactNode,
}

const CollapsibleContainer = memo((props: CollapsibleContainerProps): JSX.Element => {

  const { Nav, className, children } = props;

  const { data: currentProductNavWidth } = useCurrentProductNavWidth();
  const { data: isCollapsedMode } = useCollapsedMode();
  const { data: isCollapsedContentsOpened, mutate: mutateCollapsedContentsOpened } = useCollapsedContentsOpened();


  // open menu when collapsed mode
  const primaryItemHoverHandler = useCallback(() => {
    // reject other than collapsed mode
    if (!isCollapsedMode) {
      return;
    }

    mutateCollapsedContentsOpened(true);
  }, [isCollapsedMode, mutateCollapsedContentsOpened]);

  // close menu when collapsed mode
  const mouseLeaveHandler = useCallback(() => {
    // reject other than collapsed mode
    if (!isCollapsedMode) {
      return;
    }

    mutateCollapsedContentsOpened(false);
  }, [isCollapsedMode, mutateCollapsedContentsOpened]);

  const openClass = `${isCollapsedContentsOpened ? 'open' : ''}`;
  const collapsibleContentsWidth = isCollapsedMode ? currentProductNavWidth : undefined;

  return (
    <div className={`flex-expand-horiz ${className}`} onMouseLeave={mouseLeaveHandler}>
      <Nav onPrimaryItemHover={primaryItemHoverHandler} />
      <div className={`sidebar-contents-container flex-grow-1 overflow-y-auto ${openClass}`} style={{ width: collapsibleContentsWidth }}>
        {children}
      </div>
    </div>
  );

});


type DrawableContainerProps = {
  className?: string,
  children?: React.ReactNode,
}

const DrawableContainer = memo((props: DrawableContainerProps): JSX.Element => {

  const { className, children } = props;

  const { data: isDrawerOpened } = useDrawerOpened();

  const openClass = `${isDrawerOpened ? 'open' : ''}`;

  return (
    <div className={`${className} ${openClass}`}>
      {children}
    </div>
  );
});


export const Sidebar = (): JSX.Element => {

  const { data: isDrawerMode } = useDrawerMode();
  const { data: isCollapsedMode } = useCollapsedMode();

  // css styles
  const grwSidebarClass = styles['grw-sidebar'];
  // eslint-disable-next-line no-nested-ternary
  const modeClass = isDrawerMode
    ? 'grw-sidebar-drawer'
    : isCollapsedMode
      ? 'grw-sidebar-collapsed'
      : 'grw-sidebar-dock';

  return (
    <DrawableContainer className={`${grwSidebarClass} ${modeClass} border-end vh-100`} data-testid="grw-sidebar">
      <ResizableContainer>
        <SidebarHead />
        <CollapsibleContainer Nav={SidebarNav} className="border-top">
          <SidebarContents />
        </CollapsibleContainer>
      </ResizableContainer>
    </DrawableContainer>
  );
};
