import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import styles from '../PageTree/ItemsTree.module.scss';

const PageTreeContentSkeleton = (): JSX.Element => {

  return (
    <ul className={`grw-pagetree ${styles['grw-pagetree']} list-group p-3`} >
      <Skeleton additionalClass={styles['grw-pagetree-item-skeleton']} />
      <Skeleton additionalClass={`${styles['grw-pagetree-item-skeleton']} ${styles['grw-pagetree-item-skeleton-children']}`} />
      <Skeleton additionalClass={`${styles['grw-pagetree-item-skeleton']} ${styles['grw-pagetree-item-skeleton-children']}`} />
    </ul>
  );
};

export default PageTreeContentSkeleton;
