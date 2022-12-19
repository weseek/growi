import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import styles from '../CustomSidebar.module.scss';

const CustomSidebarContentSkeleton = (): JSX.Element => {

  return (
    <div className={`py-3 grw-custom-sidebar-content ${styles['grw-custom-sidebar-content']}`}>
      <Skeleton additionalClass={`grw-custom-sidebar-skeleton-text-full ${styles['grw-custom-sidebar-skeleton-text-full']}`} />
      <Skeleton additionalClass={`grw-custom-sidebar-skeleton-text-full ${styles['grw-custom-sidebar-skeleton-text-full']}`} />
      <Skeleton additionalClass={`grw-custom-sidebar-skeleton-text ${styles['grw-custom-sidebar-skeleton-text']}`} />
    </div>
  );
};

export default CustomSidebarContentSkeleton;
