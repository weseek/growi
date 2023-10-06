import React from 'react';

import {
  EditorMode, useEditorMode,
} from '~/stores/ui';

import PagePathNav from '../PagePathNav';

import DrawerToggler from './DrawerToggler';


import styles from './GrowiSubNavigation.module.scss';


export type GrowiSubNavigationProps = {
  pagePath?: string,
  pageId?: string,
  isNotFound?: boolean,
  showDrawerToggler?: boolean,
  isTagLabelsDisabled?: boolean,
  isDrawerMode?: boolean,
  isCompactMode?: boolean,
  tags?: string[],
  rightComponent?: React.FunctionComponent,
  additionalClasses?: string[],
}

export const GrowiSubNavigation = (props: GrowiSubNavigationProps): JSX.Element => {

  const { data: editorMode } = useEditorMode();

  const {
    pageId, pagePath,
    showDrawerToggler,
    isDrawerMode, isCompactMode,
    rightComponent: RightComponent,
    additionalClasses = [],
  } = props;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;
  const compactModeClasses = isCompactMode ? 'grw-subnav-compact d-print-none' : '';

  return (
    <div className={`
      grw-subnav ${styles['grw-subnav']} d-flex align-items-center justify-content-between
      ${additionalClasses.join(' ')}
      ${compactModeClasses}`}
    >
      {/* Left side */}
      <div className="d-flex grw-subnav-start-side">
        { (showDrawerToggler && isDrawerMode) && (
          <div className={`d-none d-md-flex align-items-center ${isEditorMode ? 'me-2 pe-2' : 'border-end me-4 pe-4'}`}>
            <DrawerToggler />
          </div>
        ) }
        <div className="grw-path-nav-container">
          { pagePath != null && (
            <PagePathNav pageId={pageId} pagePath={pagePath} isSingleLineMode={isEditorMode} isCompactMode={isCompactMode} />
          ) }
        </div>
      </div>
      {/* Right side. */}
      { RightComponent && (
        <RightComponent />
      ) }
    </div>
  );
};
