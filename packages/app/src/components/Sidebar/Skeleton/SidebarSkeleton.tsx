import React, { memo } from 'react';

import { useTranslation } from 'next-i18next';

import { SidebarContentsType } from '~/interfaces/ui';
import { useCurrentSidebarContents } from '~/stores/ui';

import CustomSidebarContentSkeleton from './CustomSidebarContentSkeleton';
import PageTreeContentSkeleton from './PageTreeContentSkeleton';
import RecentChangesContentSkeleton from './RecentChangesContentSkeleton';
import TagContentSkeleton from './TagContentSkeleton';

export const SidebarSkeleton = memo(() => {
  const { t } = useTranslation();
  const { data: currentSidebarContents } = useCurrentSidebarContents();

  let Contents: () => JSX.Element;
  let title: string;
  switch (currentSidebarContents) {

    case SidebarContentsType.RECENT:
      Contents = RecentChangesContentSkeleton;
      title = t('Recent Changes');
      break;
    case SidebarContentsType.CUSTOM:
      Contents = CustomSidebarContentSkeleton;
      title = t('CustomSidebar');
      break;
    case SidebarContentsType.TAG:
      Contents = TagContentSkeleton;
      title = t('Tags');
      break;
    case SidebarContentsType.TREE:
    default:
      Contents = PageTreeContentSkeleton;
      title = t('Page Tree');
      break;
  }

  return (
    <div className={currentSidebarContents === SidebarContentsType.TAG ? 'px-4' : 'px-3'}>
      <div className="grw-sidebar-content-header py-3">
        <h3 className="mb-0">{title}</h3>
      </div>
      <Contents />
    </div>
  );
});
SidebarSkeleton.displayName = 'SidebarSkeleton';
