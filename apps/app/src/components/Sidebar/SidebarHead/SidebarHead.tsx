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
    <div className={`${styles['grw-sidebar-head']} d-flex justify-content-between`}>
      {/* Brand Logo  */}
      <Link href="/" className="grw-logo d-block">
        <SidebarBrandLogo isDefaultLogo={isDefaultLogo} />
      </Link>
      <button type="button" className="btn btn-secondary btn-lg">
        <span className="material-icons">first_page</span>
      </button>
    </div>
  );

});
