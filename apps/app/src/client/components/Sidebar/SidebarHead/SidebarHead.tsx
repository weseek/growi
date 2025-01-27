import React, {
  type FC, memo,
} from 'react';

import Link from 'next/link';

import { useIsDefaultLogo } from '~/stores-universal/context';
import { EditorMode, useEditorMode } from '~/stores-universal/ui';


import { SidebarBrandLogo } from '../SidebarBrandLogo';

import { ToggleCollapseButton } from './ToggleCollapseButton';

import styles from './SidebarHead.module.scss';


export const SidebarHead: FC = memo(() => {
  const { data: editorMode } = useEditorMode();
  const { data: isDefaultLogo } = useIsDefaultLogo();
  return (
    <div className={`${styles['grw-sidebar-head']} d-flex justify-content-end w-100`}>
      {editorMode === EditorMode.Editor ? (
        <Link
          href="/"
          className="grw-editor-logo p-2"
          data-testid="btn-brand-logo"
        >
          <SidebarBrandLogo isDefaultLogo={isDefaultLogo} />
        </Link>
      ) : (
        <ToggleCollapseButton />
      )}
    </div>
  );

});
