import React, { FC } from 'react';

import RecentChanges from './RecentChanges';
import CustomSidebar from './CustomSidebar';
import { useCurrentSidebarContents, SidebarContents as SidebarContentType } from '~/stores/ui';

type Props = {
  isSharedUser?: boolean,
};

const SidebarContents: FC<Props> = (props: Props) => {

  const { data: currentSidebarContents } = useCurrentSidebarContents();

  const { isSharedUser } = props;

  if (isSharedUser) {
    return null;
  }

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


SidebarContents.defaultProps = {
  isSharedUser: false,
};

export default SidebarContents;
