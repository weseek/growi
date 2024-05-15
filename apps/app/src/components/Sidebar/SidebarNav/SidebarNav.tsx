import React, { memo } from 'react';

import type { SidebarContentsType } from '~/interfaces/ui';
import { useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';

import { PageCreateButton } from '../PageCreateButton';

import { PrimaryItems } from './PrimaryItems';
import { SecondaryItems } from './SecondaryItems';

import styles from './SidebarNav.module.scss';

export type SidebarNavProps = {
  onPrimaryItemHover?: (contents: SidebarContentsType) => void,
}

export const SidebarNav = memo((props: SidebarNavProps) => {
  const { onPrimaryItemHover } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  return (
    <div className={`grw-sidebar-nav ${styles['grw-sidebar-nav']}`}>
      {!(isGuestUser || isReadOnlyUser) && <PageCreateButton />}

      <div className="grw-sidebar-nav-primary-container" data-vrt-blackout-sidebar-nav>
        <PrimaryItems onItemHover={onPrimaryItemHover} />
      </div>

      <div className="grw-sidebar-nav-secondary-container">
        <SecondaryItems />
      </div>
    </div>
  );
});
