import React from 'react';

import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';

// TODO: implement Skelton of other 3 components

// import CustomSidebarSkelton from './CustomSidebarSkelton';
import PageTreeSkelton from './PageTreeSkelton';
// import RecentChangesSkelton from './RecentChangesSkelton';
// import TagSkelton from './TagSkelton';

export const SidebarSkelton = (): JSX.Element => {

  const { data: currentSidebarContents } = useCurrentSidebarContents();

  let Contents;
  switch (currentSidebarContents) {
    /*
    case SidebarContentsType.RECENT:
      Contents = RecentChangesSkelton;
      break;
    case SidebarContentsType.CUSTOM:
      Contents = CustomSidebarSkelton;
      break;
    case SidebarContentsType.TAG:
      Contents = TagSkelton;
      break;
    */
    default:
      Contents = PageTreeSkelton;
  }

  return (
    <Contents />
  );
};
