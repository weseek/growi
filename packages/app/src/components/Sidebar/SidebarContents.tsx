import React, { FC } from 'react';

import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';

import RecentChanges from './RecentChanges';
import CustomSidebar from './CustomSidebar';

type Props = {
};

const SidebarContents: FC<Props> = (props: Props) => {

  const { data: currentSidebarContents } = useCurrentSidebarContents();

  let Contents;
  switch (currentSidebarContents) {
    case SidebarContentsType.RECENT:
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
