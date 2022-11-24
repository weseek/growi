import React from 'react';

import { Skelton } from '~/components/Skelton';

import styles from './SidebarHeaderSkelton.module.scss';

const SidebarHeaderSkelton = (): JSX.Element => {
  return (
    <div className="grw-sidebar-content-header p-3">
      <Skelton additionalClass={styles['grw-sidebar-content-header-skelton']} />
    </div>
  );
};
export default SidebarHeaderSkelton;
