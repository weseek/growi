import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import styles from '../PageTree/ItemsTree.module.scss';

const PageTreeContentSkeleton = (): JSX.Element => {

  return (
    <ul className={`grw-pagetree ${styles['grw-pagetree']} list-group p-3`} >
      <Skeleton additionalClass={styles['grw-pagetree-item-skelton']} />
      <Skeleton additionalClass={`${styles['grw-pagetree-item-skelton']} ${styles['grw-pagetree-item-skelton-children']}`} />
      <Skeleton additionalClass={`${styles['grw-pagetree-item-skelton']} ${styles['grw-pagetree-item-skelton-children']}`} />
    </ul>
  );
};

export default PageTreeContentSkeleton;
