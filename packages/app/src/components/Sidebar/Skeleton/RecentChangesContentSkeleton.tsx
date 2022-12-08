import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import recentChangesStyles from '../RecentChanges.module.scss';
import styles from './SidebarSkeleton.module.scss';

const SkeletonItem = () => {

  return (
    <li className={`list-group-item ${recentChangesStyles['list-group-item']} py-3 px-0`}>
      <div className="d-flex w-100">
        <Skeleton additionalClass='rounded-circle picture' roundedPill />
        <div className="flex-grow-1 ml-2">
          <Skeleton additionalClass={`${styles['grw-sidebar-skeleton-text-medium']} mb-2`} />
          <Skeleton additionalClass={`${styles['grw-sidebar-skeleton-text-medium']} my-2`} />
          <div className="d-flex justify-content-between grw-recent-changes-item-lower mt-2">
            <Skeleton additionalClass={styles['grw-sidebar-skeleton-recent-changes-icons']} />
            <Skeleton additionalClass={styles['grw-sidebar-skeleton-recent-changes-icons']} />
          </div>
        </div>
      </div>
    </li>
  );
};

const RecentChangesContentSkeleton = (): JSX.Element => {

  return (
    <div className="grw-recent-changes p-3">
      <ul className="list-group list-group-flush">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </ul>
    </div>);
};

export default RecentChangesContentSkeleton;
