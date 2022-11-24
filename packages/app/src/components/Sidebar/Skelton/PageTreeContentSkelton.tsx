import React from 'react';

import { Skelton } from '~/components/Skelton';

import styles from '../PageTree/ItemsTree.module.scss';

const PageTreeContentSkelton = (): JSX.Element => {

  return (
    <ul className={`grw-pagetree ${styles['grw-pagetree']} list-group p-3`} >
      <Skelton additionalClass={styles['grw-pagetree-item-skelton']} />
      <Skelton additionalClass={`${styles['grw-pagetree-item-skelton']} ${styles['grw-pagetree-item-skelton-children']}`} />
      <Skelton additionalClass={`${styles['grw-pagetree-item-skelton']} ${styles['grw-pagetree-item-skelton-children']}`} />
    </ul>
  );
};

export default PageTreeContentSkelton;
