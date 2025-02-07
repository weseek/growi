import React, { memo } from 'react';

import Link from 'next/link';
import { UncontrolledTooltip } from 'reactstrap';

import { useAppTitle, useConfidential, useIsDefaultLogo } from '~/stores-universal/context';
import { EditorMode, useEditorMode } from '~/stores-universal/ui';
import { useIsDeviceLargerThanXl } from '~/stores/ui';

import { SidebarBrandLogo } from '../SidebarBrandLogo';

import styles from './AppTitle.module.scss';


type Props = {
  className?: string,
}

const AppTitleSubstance = memo((props: Props): JSX.Element => {

  const { className } = props;

  const { data: isDefaultLogo } = useIsDefaultLogo();
  const { data: appTitle } = useAppTitle();
  const { data: confidential } = useConfidential();
  const { data: editorMode } = useEditorMode();
  const { data: isXlSize } = useIsDeviceLargerThanXl();

  const isEditorMode = editorMode === EditorMode.Editor;
  const isXlEditorMode = isEditorMode && isXlSize;

  return (
    <div className={`${styles['grw-app-title']} ${className} d-flex`}>
      {/* Brand Logo  */}
      <Link href="/" className="grw-logo d-block">
        <SidebarBrandLogo isDefaultLogo={isDefaultLogo} />
      </Link>
      <div className="flex-grow-1 d-flex align-items-center justify-content-between gap-3 overflow-hidden">
        {!isXlEditorMode && (
          <div id="grw-site-name" className="grw-site-name text-truncate">
            <Link href="/" className="fs-4">
              {appTitle}
            </Link>
          </div>
        )}
      </div>
      {!(confidential == null || confidential === '') && (
        <UncontrolledTooltip
          className="d-none d-sm-block confidential-tooltip"
          innerClassName="text-start"
          data-testid="confidential-tooltip"
          placement="top"
          target="grw-site-name"
          fade={false}
        >
          {confidential}
        </UncontrolledTooltip>
      )}
    </div>
  );
});

export const AppTitleOnSubnavigation = memo((): JSX.Element => {
  return <AppTitleSubstance className={`position-absolute ${styles['on-subnavigation']}`} />;
});

export const AppTitleOnSidebarHead = memo((): JSX.Element => {
  const { data: editorMode } = useEditorMode();
  const { data: isXlSize } = useIsDeviceLargerThanXl();

  const isEditorMode = editorMode === EditorMode.Editor;
  const isXlEditorMode = isEditorMode && isXlSize;

  const positionClass = isXlEditorMode ? '' : 'position-absolute z-1';

  return (
    <AppTitleSubstance
      className={`${positionClass} ${styles['on-sidebar-head']}`}
    />
  );
});
