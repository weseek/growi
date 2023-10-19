import React, {
  FC, memo,
} from 'react';

import Link from 'next/link';

import { useIsDefaultLogo } from '~/stores/context';

import { SidebarBrandLogo } from '../SidebarBrandLogo';


import styles from './SidebarHead.module.scss';


export const SidebarHead: FC = memo(() => {

  const { data: isDefaultLogo } = useIsDefaultLogo();

  return (
    <div className={styles['grw-sidebar-head']}>
      {/* Brand Logo  */}
      <div className="navbar-brand">
        <Link href="/" className="grw-logo d-block">
          <SidebarBrandLogo isDefaultLogo={isDefaultLogo} />
        </Link>
      </div>
    </div>
  );

});
