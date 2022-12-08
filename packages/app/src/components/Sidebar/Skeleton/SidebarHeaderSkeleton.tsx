import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import styles from './SidebarSkeleton.module.scss';

const SidebarHeaderSkeleton = (): JSX.Element => {
  return (
    <div className="grw-sidebar-content-header p-3">
      <Skeleton additionalClass={styles['grw-sidebar-content-header-skeleton']} />
    </div>
  );
};
export default SidebarHeaderSkeleton;
