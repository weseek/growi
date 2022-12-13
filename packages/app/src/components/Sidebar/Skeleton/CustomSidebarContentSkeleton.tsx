import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import styles from '../CustomSidebar.module.scss';

const CustomSidebarContentSkeleton = (): JSX.Element => {

  return (
    <div className={`p-3 grw-custom-sidebar-content ${styles['grw-custom-sidebar-content']}`}>
      <Skeleton additionalClass={`grw-custom-sidebar-skeleton-text ${styles['grw-custom-sidebar-skeleton-text']} mt-3`} />
      <Skeleton additionalClass={`grw-custom-sidebar-skeleton-text ${styles['grw-custom-sidebar-skeleton-text']} my-4`} />
    </div>
  );
};

export default CustomSidebarContentSkeleton;
