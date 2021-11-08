import React, { FC } from 'react';

import RecentChanges from './RecentChanges';
import CustomSidebar from './CustomSidebar';
import { useCurrentSidebarContents, SidebarContents as SidebarContentType } from '~/stores/ui';

type Props = {
};

const SidebarContents: FC<Props> = (props: Props) => {

  const { data: currentSidebarContents } = useCurrentSidebarContents();

  let Contents;
  switch (currentSidebarContents) {
    case SidebarContentType.RECENT:
      Contents = RecentChanges;
      break;
    default:
      Contents = CustomSidebar;
  }

  return (
    <Contents />
  );

};

export default SidebarContents;
