import React from 'react';

import { Skelton } from '~/components/Skelton';

import styles from './ItemsTree.module.scss';

const ItemsTreeSkelton = (): JSX.Element => {

  return (
    <ul className={`grw-pagetree ${styles['grw-pagetree']} list-group p-3`} >
      <Skelton additionalClass={styles['grw-pagetree-item-skelton']} />
      <Skelton additionalClass={`${styles['grw-pagetree-item-skelton']} ${styles['grw-pagetree-item-skelton-children']}`} />
      <Skelton additionalClass={`${styles['grw-pagetree-item-skelton']} ${styles['grw-pagetree-item-skelton-children']}`} />
    </ul>
  );
};

export default ItemsTreeSkelton;
