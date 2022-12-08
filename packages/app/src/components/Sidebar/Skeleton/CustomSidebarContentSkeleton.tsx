import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import customSidebarStyles from '../CustomSidebar.module.scss';
import styles from './SidebarSkeleton.module.scss';

const CustomSidebarContentSkeleton = (): JSX.Element => {

  return (
    <div className={`p-3 grw-custom-sidebar-content ${customSidebarStyles['grw-custom-sidebar-content']}`}>
      <Skeleton additionalClass={`${styles['grw-sidebar-skeleton-text-full']} mt-3`} />
      <Skeleton additionalClass={`${styles['grw-sidebar-skeleton-text-full']} my-4`} />
    </div>
  );
};

export default CustomSidebarContentSkeleton;
