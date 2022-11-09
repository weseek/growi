import React from 'react';

import { Skelton } from '~/components/Skelton';

import ItemsTreeSkelton from './PageTree/ItemsTreeSkelton';

import styles from './SidebarSkelton.module.scss';

const PageTreeSkelton = (): JSX.Element => {

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <Skelton additionalClass={styles['grw-sidebar-content-header-skelton']} />
      </div>
      <ItemsTreeSkelton />
    </>
  );
};

export default PageTreeSkelton;
