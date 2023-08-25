import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import styles from '../PageTree/ItemsTree.module.scss';

const PageTreeContentSkeleton = (): JSX.Element => {

  return (
    <ul className={`grw-pagetree ${styles['grw-pagetree']} list-group py-3`}>
      <Skeleton additionalClass={`${styles['grw-pagetree-item-skeleton-text']} pr-3`} />
      <Skeleton additionalClass={`${styles['grw-pagetree-item-skeleton-text-child']} pr-3`} />
      <Skeleton additionalClass={`${styles['grw-pagetree-item-skeleton-text-child']} pr-3`} />
    </ul>
  );
};

export default PageTreeContentSkeleton;
