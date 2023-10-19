import React, {
  FC, memo,
} from 'react';

import { PageCreateButton } from '../PageCreateButton';

import { PrimaryItems } from './PrimaryItems';
import { SecondaryItems } from './SecondaryItems';

import styles from './SidebarNav.module.scss';


export const SidebarNav: FC = memo(() => {
  return (
    <div className={`grw-sidebar-nav ${styles['grw-sidebar-nav']}`}>
      <PageCreateButton />

      <div className="grw-sidebar-nav-primary-container" data-vrt-blackout-sidebar-nav>
        <PrimaryItems />
      </div>
      <div className="grw-sidebar-nav-secondary-container">
        <SecondaryItems />
      </div>
    </div>
  );
});
