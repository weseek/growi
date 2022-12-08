import React from 'react';

import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';

// TODO: implement Skeleton of other 3 components

// import CustomSidebarContentSkeleton from './CustomSidebarContentSkeleton';
import PageTreeContentSkeleton from './PageTreeContentSkeleton';
// import RecentChangesContentSkeleton from './RecentChangesContentSkeleton';
// import TagContentSkeleton from './TagContentSkeleton';
import SidebarHeaderSkeleton from './SidebarHeaderSkeleton';

export const SidebarSkeleton = (): JSX.Element => {

  const { data: currentSidebarContents } = useCurrentSidebarContents();

  let SidebarContentSkeleton;
  switch (currentSidebarContents) {

    /*
    case SidebarContentsType.RECENT:
      SidebarContentSkeleton = RecentChangesContentSkeleton;
      break;
    case SidebarContentsType.CUSTOM:
      SidebarContentSkeleton = CustomSidebarContentSkeleton;
      break;
    case SidebarContentsType.TAG:
      SidebarContentSkeleton = TagContentSkeleton;
      break;
    */
    default:
      SidebarContentSkeleton = PageTreeContentSkeleton;
  }

  return (
    <>
      <SidebarHeaderSkeleton />
      <SidebarContentSkeleton />
    </>
  );
};
