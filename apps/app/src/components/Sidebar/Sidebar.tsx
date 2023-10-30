import React, {
  type FC,
  memo, useCallback, useEffect, useState,
} from 'react';

import dynamic from 'next/dynamic';

import { scheduleToPut } from '~/client/services/user-ui-settings';
import { SidebarMode } from '~/interfaces/ui';
import {
  useDrawerOpened,
  useCollapsedContentsOpened,
  useCurrentProductNavWidth,
  usePreferCollapsedMode,
  useSidebarMode,
} from '~/stores/ui';

import { AppTitleOnSidebarHead, AppTitleOnSubnavigation } from './AppTitle/AppTitle';
import { ResizableArea } from './ResizableArea/ResizableArea';
import { SidebarHead } from './SidebarHead';
import { SidebarNav, type SidebarNavProps } from './SidebarNav';

import styles from './Sidebar.module.scss';
import { ToggleCollapseButton } from './SidebarHead/ToggleCollapseButton';


const SidebarContents = dynamic(() => import('./SidebarContents').then(mod => mod.SidebarContents), { ssr: false });


const resizableAreaMinWidth = 348;
const sidebarNavCollapsedWidth = 48;


type ResizableContainerProps = {
  children?: React.ReactNode,
}

const ResizableContainer = memo((props: ResizableContainerProps): JSX.Element => {

  const { children } = props;

  const { isDrawerMode, isCollapsedMode, isDockMode } = useSidebarMode();
  const { mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: currentProductNavWidth, mutate: mutateProductNavWidth } = useCurrentProductNavWidth();
  const { mutate: mutatePreferCollapsedMode } = usePreferCollapsedMode();
  const { mutate: mutateCollapsedContentsOpened } = useCollapsedContentsOpened();

  const [resizableAreaWidth, setResizableAreaWidth] = useState<number|undefined>(undefined);

  const resizeHandler = useCallback((newWidth: number) => {
    setResizableAreaWidth(newWidth);
  }, []);

  const resizeDoneHandler = useCallback((newWidth: number) => {
    mutateProductNavWidth(newWidth, false);
    scheduleToPut({ preferCollapsedModeByUser: false, currentProductNavWidth: newWidth });
  }, [mutateProductNavWidth]);

  const collapsedByResizableAreaHandler = useCallback(() => {
    mutatePreferCollapsedMode(true);
    mutateCollapsedContentsOpened(false);
    scheduleToPut({ preferCollapsedModeByUser: true });
  }, [mutateCollapsedContentsOpened, mutatePreferCollapsedMode]);


  // open/close resizable container when drawer mode
  useEffect(() => {
    if (isDrawerMode()) {
      setResizableAreaWidth(undefined);
    }
    else if (isCollapsedMode()) {
      setResizableAreaWidth(sidebarNavCollapsedWidth);
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setResizableAreaWidth(currentProductNavWidth!);
    }

    mutateDrawerOpened(false);
  }, [currentProductNavWidth, isCollapsedMode, isDrawerMode, mutateDrawerOpened]);

  return (
    <ResizableArea
      className="flex-expand-vert"
      width={resizableAreaWidth}
      minWidth={resizableAreaMinWidth}
      disabled={!isDockMode()}
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

  const { isCollapsedMode } = useSidebarMode();
  const { data: currentProductNavWidth } = useCurrentProductNavWidth();
  const { data: isCollapsedContentsOpened, mutate: mutateCollapsedContentsOpened } = useCollapsedContentsOpened();


  // open menu when collapsed mode
  const primaryItemHoverHandler = useCallback(() => {
    // reject other than collapsed mode
    if (!isCollapsedMode()) {
      return;
    }

    mutateCollapsedContentsOpened(true);
  }, [isCollapsedMode, mutateCollapsedContentsOpened]);

  // close menu when collapsed mode
  const mouseLeaveHandler = useCallback(() => {
    // reject other than collapsed mode
    if (!isCollapsedMode()) {
      return;
    }

    mutateCollapsedContentsOpened(false);
  }, [isCollapsedMode, mutateCollapsedContentsOpened]);

  const openClass = `${isCollapsedContentsOpened ? 'open' : ''}`;
  const collapsibleContentsWidth = isCollapsedMode() ? currentProductNavWidth : undefined;

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

  const { data: sidebarMode, isDrawerMode, isDockMode } = useSidebarMode();

  // css styles
  const grwSidebarClass = styles['grw-sidebar'];
  // eslint-disable-next-line no-nested-ternary
  let modeClass;
  switch (sidebarMode) {
    case SidebarMode.DRAWER:
      modeClass = 'grw-sidebar-drawer';
      break;
    case SidebarMode.COLLAPSED:
      modeClass = 'grw-sidebar-collapsed';
      break;
    case SidebarMode.DOCK:
      modeClass = 'grw-sidebar-dock';
      break;
  }

  return (
    <>
      { sidebarMode != null && isDrawerMode() && (
        <div className="vh-100 sticky-top">
          <ToggleCollapseButton />
        </div>
      ) }
      { sidebarMode != null && !isDockMode() && <AppTitleOnSubnavigation /> }
      <DrawableContainer className={`${grwSidebarClass} ${modeClass} border-end vh-100`} data-testid="grw-sidebar">
        <ResizableContainer>
          { sidebarMode != null && isDockMode() && <AppTitleOnSidebarHead /> }
          <SidebarHead />
          <CollapsibleContainer Nav={SidebarNav} className="border-top">
            <SidebarContents />
          </CollapsibleContainer>
        </ResizableContainer>
      </DrawableContainer>
    </>
  );
};
