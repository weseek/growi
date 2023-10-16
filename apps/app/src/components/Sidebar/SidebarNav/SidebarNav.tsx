import React, {
  FC, memo,
} from 'react';

import Link from 'next/link';

import { useIsDefaultLogo } from '~/stores/context';

import DrawerToggler from '../../Navbar/DrawerToggler';
import { SidebarBrandLogo } from '../SidebarBrandLogo';

import { PrimaryItems } from './PrimaryItems';
import { SecondaryItems } from './SecondaryItems';

import styles from './SidebarNav.module.scss';


export const SidebarNav: FC = memo(() => {

  const { data: isDefaultLogo } = useIsDefaultLogo();

  return (
    <div className={`grw-sidebar-nav ${styles['grw-sidebar-nav']}`}>
      {/* Brand Logo  */}
      <div className="navbar-brand">
        <Link href="/" className="grw-logo d-block">
          <SidebarBrandLogo isDefaultLogo={isDefaultLogo} />
        </Link>
      </div>
      <DrawerToggler />

      <div className="grw-sidebar-nav-primary-container" data-vrt-blackout-sidebar-nav>
        <PrimaryItems />
      </div>
      <div className="grw-sidebar-nav-secondary-container">
        <SecondaryItems />
      </div>
    </div>
  );

});
