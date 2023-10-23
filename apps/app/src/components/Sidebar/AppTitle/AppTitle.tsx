import React, {
  type FC, memo,
} from 'react';

import Link from 'next/link';

import { useIsDefaultLogo } from '~/stores/context';
import { useSidebarMode } from '~/stores/ui';

import { SidebarBrandLogo } from '../SidebarBrandLogo';

import styles from './AppTitle.module.scss';


export const AppTitle: FC = memo(() => {

  const { isCollapsedMode } = useSidebarMode();

  const { data: isDefaultLogo } = useIsDefaultLogo();

  const collapsedModeClass = isCollapsedMode() ? 'collapsed' : '';

  return (
    <div className={`${styles['grw-app-title']} ${collapsedModeClass} position-absolute d-flex justify-content-end w-100`}>
      {/* Brand Logo  */}
      <Link href="/" className="grw-logo d-block">
        <SidebarBrandLogo isDefaultLogo={isDefaultLogo} />
      </Link>
      <div className="flex-grow-1 d-flex align-items-center justify-content-between gap-3 overflow-hidden">
        <div className="grw-site-name text-truncate">
          <span className="fs-4">GROWI</span>
        </div>
      </div>
    </div>
  );

});
