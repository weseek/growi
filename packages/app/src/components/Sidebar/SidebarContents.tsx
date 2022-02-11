import React, { FC } from 'react';

import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';
import RecentChanges from './RecentChanges';
import CustomSidebar from './CustomSidebar';
import PageTree from './PageTree';
import Tag from './Tag';

import AppContainer from '~/client/services/AppContainer';

type Props = {
  appContainer: AppContainer
};

const SidebarContents: FC<Props> = (props: Props) => {
  const { data: currentSidebarContents } = useCurrentSidebarContents();

  let Contents;
  switch (currentSidebarContents) {
    case SidebarContentsType.RECENT:
      Contents = RecentChanges;
      break;
    case SidebarContentsType.TREE:
      Contents = PageTree;
      break;
    case SidebarContentsType.TAG:
      Contents = Tag;
      break;
    default:
      Contents = CustomSidebar;
  }

  return (
    <Contents appContainer={props.appContainer} />
  );

};

export default SidebarContents;
