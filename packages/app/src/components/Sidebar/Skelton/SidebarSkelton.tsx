import React from 'react';

import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';

// TODO: implement Skelton of other 3 components

// import CustomSidebarContentSkelton from './CustomSidebarContentSkelton';
import PageTreeContentSkelton from './PageTreeContentSkelton';
// import RecentChangesContentSkelton from './RecentChangesContentSkelton';
// import TagContentSkelton from './TagContentSkelton';
import SidebarHeaderSkelton from './SidebarHeaderSkelton';

export const SidebarSkelton = (): JSX.Element => {

  const { data: currentSidebarContents } = useCurrentSidebarContents();

  let SidebarContentSkelton;
  switch (currentSidebarContents) {
    /*
    case SidebarContentsType.RECENT:
      SidebarContentSkelton = RecentChangesContentSkelton;
      break;
    case SidebarContentsType.CUSTOM:
      SidebarContentSkelton = CustomSidebarContentSkelton;
      break;
    case SidebarContentsType.TAG:
      SidebarContentSkelton = TagContentSkelton;
      break;
    */
    default:
      SidebarContentSkelton = PageTreeContentSkelton;
  }

  return (
    <>
      <SidebarHeaderSkelton />
      <SidebarContentSkelton />
    </>
  );
};
