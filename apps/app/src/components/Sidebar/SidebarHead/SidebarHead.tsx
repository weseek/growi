import React, {
  type FC, memo,
} from 'react';

import Link from 'next/link';

import { useIsDefaultLogo } from '~/stores/context';
import { useCollapsedContentsOpened, useCollapsedMode } from '~/stores/ui';

import { SidebarBrandLogo } from '../SidebarBrandLogo';

import { ToggleCollapseButton } from './ToggleCollapseButton';

import styles from './SidebarHead.module.scss';


export const SidebarHead: FC = memo(() => {

  const { data: isCollapsedMode, mutate: mutateCollapsedMode } = useCollapsedMode();
  const { mutate: mutateCollapsedContentsOpened } = useCollapsedContentsOpened();

  const { data: isDefaultLogo } = useIsDefaultLogo();

  const popoutClass = isCollapsedMode ? 'popout' : '';

  return (
    <div className={`${styles['grw-sidebar-head']} d-flex w-100`}>
      {/* Brand Logo  */}
      <Link href="/" className={`grw-logo d-block ${popoutClass}`}>
        <SidebarBrandLogo isDefaultLogo={isDefaultLogo} />
      </Link>
      <div className="flex-grow-1 d-flex align-items-center justify-content-between gap-3 overflow-hidden">
        <div className={`grw-app-title text-truncate ${popoutClass}`}>
          <span className="fs-4">GROWI</span>
        </div>
        <ToggleCollapseButton />
      </div>
    </div>
  );

});
