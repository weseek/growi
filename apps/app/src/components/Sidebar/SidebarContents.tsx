import React, { memo } from 'react';

import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';


import { Bookmarks } from './Bookmarks';
import { CustomSidebar } from './Custom';
import { PageTree } from './PageTree';
import { RecentChanges } from './RecentChanges';
import Tag from './Tag';

import styles from './SidebarContents.module.scss';


export const SidebarContents = memo(() => {
  const { data: currentSidebarContents } = useCurrentSidebarContents();

  let Contents;
  switch (currentSidebarContents) {
    case SidebarContentsType.RECENT:
      Contents = RecentChanges;
      break;
    case SidebarContentsType.CUSTOM:
      Contents = CustomSidebar;
      break;
    case SidebarContentsType.TAG:
      Contents = Tag;
      break;
    case SidebarContentsType.BOOKMARKS:
      Contents = Bookmarks;
      break;
    default:
      Contents = PageTree;
  }

  return (
    <div className={`grw-sidebar-contents ${styles['grw-sidebar-contents']}`} data-testid="grw-sidebar-contents">
      <Contents />
    </div>
  );
});
SidebarContents.displayName = 'SidebarContents';
