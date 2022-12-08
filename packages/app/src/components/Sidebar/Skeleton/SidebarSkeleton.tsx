import React from 'react';

import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';

import CustomSidebarContentSkeleton from './CustomSidebarContentSkeleton';
import PageTreeContentSkeleton from './PageTreeContentSkeleton';
import RecentChangesContentSkeleton from './RecentChangesContentSkeleton';
import SidebarHeaderSkeleton from './SidebarHeaderSkeleton';
import TagContentSkeleton from './TagContentSkeleton';

export const SidebarSkeleton = (): JSX.Element => {

  const { data: currentSidebarContents } = useCurrentSidebarContents();

  let SidebarContentSkeleton: () => JSX.Element;
  switch (currentSidebarContents) {

    case SidebarContentsType.TAG:
      SidebarContentSkeleton = TagContentSkeleton;
      break;
    case SidebarContentsType.TREE:
      SidebarContentSkeleton = PageTreeContentSkeleton;
      break;
    case SidebarContentsType.RECENT:
      SidebarContentSkeleton = RecentChangesContentSkeleton;
      break;
    case SidebarContentsType.CUSTOM:
    default:
      SidebarContentSkeleton = CustomSidebarContentSkeleton;
      break;
  }

  return (
    <>
      <SidebarHeaderSkeleton />
      <SidebarContentSkeleton />
    </>
  );
};
