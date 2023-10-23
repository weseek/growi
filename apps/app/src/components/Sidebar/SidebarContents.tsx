import React, { memo, useMemo } from 'react';

import { SidebarContentsType } from '~/interfaces/ui';
import { useCollapsedContentsOpened, useCollapsedMode, useCurrentSidebarContents } from '~/stores/ui';


import { Bookmarks } from './Bookmarks';
import { CustomSidebar } from './Custom';
import { PageTree } from './PageTree';
import { RecentChanges } from './RecentChanges';
import Tag from './Tag';

import styles from './SidebarContents.module.scss';


export const SidebarContents = memo(() => {
  const { data: isCollapsedMode } = useCollapsedMode();
  const { data: isCollapsedContentsOpened } = useCollapsedContentsOpened();

  const { data: currentSidebarContents } = useCurrentSidebarContents();

  const Contents = useMemo(() => {

    // return an empty element when the collapsed mode and it is closed
    if (isCollapsedMode && !isCollapsedContentsOpened) {
      return () => <></>;
    }

    switch (currentSidebarContents) {
      case SidebarContentsType.RECENT:
        return RecentChanges;
      case SidebarContentsType.CUSTOM:
        return CustomSidebar;
      case SidebarContentsType.TAG:
        return Tag;
      case SidebarContentsType.BOOKMARKS:
        return Bookmarks;
      default:
        return PageTree;
    }
  }, [currentSidebarContents, isCollapsedContentsOpened, isCollapsedMode]);

  return (
    <div className={`grw-sidebar-contents ${styles['grw-sidebar-contents']}`} data-testid="grw-sidebar-contents">
      <Contents />
    </div>
  );
});
SidebarContents.displayName = 'SidebarContents';
