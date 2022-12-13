import React from 'react';

import { Skeleton } from '~/components/Skeleton';
import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';

import CustomSidebarContentSkeleton from './CustomSidebarContentSkeleton';
import PageTreeContentSkeleton from './PageTreeContentSkeleton';
import RecentChangesContentSkeleton from './RecentChangesContentSkeleton';
import TagContentSkeleton from './TagContentSkeleton';

import styles from './SidebarSkeleton.module.scss';

export const SidebarHeaderSkeleton = (): JSX.Element => {
  return (
    <div className="grw-sidebar-content-header p-3">
      <Skeleton additionalClass={styles['grw-sidebar-content-header-skeleton']} />
    </div>
  );
};

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
