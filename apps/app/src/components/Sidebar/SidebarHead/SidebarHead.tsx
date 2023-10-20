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
    <div className={`${styles['grw-sidebar-head']} d-flex w-100`}>
      {/* Brand Logo  */}
      <Link href="/" className="grw-logo d-block">
        <SidebarBrandLogo isDefaultLogo={isDefaultLogo} />
      </Link>
      <div className="flex-grow-1 d-flex align-items-center justify-content-between gap-3 overflow-hidden">
        <div className="grw-app-title text-truncate">
          <span className="fs-4">GROWI</span>
        </div>
        <button type="button" className="btn btn-primary btn-toggle-collapse p-2">
          <span className="material-icons fs-2">first_page</span>
        </button>
      </div>
    </div>
  );

});
