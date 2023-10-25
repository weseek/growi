import React, { memo } from 'react';

import { SidebarContentsType } from '~/interfaces/ui';

import { PageCreateButton } from '../PageCreateButton';

import { PrimaryItems } from './PrimaryItems';
import { SecondaryItems } from './SecondaryItems';

import styles from './SidebarNav.module.scss';

export type SidebarNavProps = {
  onPrimaryItemHover?: (contents: SidebarContentsType) => void,
}

export const SidebarNav = memo((props: SidebarNavProps) => {
  const { onPrimaryItemHover } = props;

  return (
    <div className={`grw-sidebar-nav ${styles['grw-sidebar-nav']}`}>
      <PageCreateButton />

      <div className="grw-sidebar-nav-primary-container" data-vrt-blackout-sidebar-nav>
        <PrimaryItems onItemHover={onPrimaryItemHover} />
      </div>
      <div className="grw-sidebar-nav-secondary-container">
        <SecondaryItems />
      </div>
    </div>
  );
});
