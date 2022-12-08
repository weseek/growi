import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import customSidebarStyles from '../CustomSidebar.module.scss';
import styles from './SidebarSkeleton.module.scss';

const TagContentSkeleton = (): JSX.Element => {

  return (
    <div className="grw-container-convertible">
      <Skeleton additionalClass={`${styles['grw-sidebar-skeleton-text-full']} my-4`} />
      <Skeleton additionalClass={`${styles['grw-sidebar-skeleton-text-full']} my-4`} />
    </div>
  );
};

export default TagContentSkeleton;
