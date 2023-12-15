import React from 'react';

import {
  EditorMode, useEditorMode,
} from '~/stores/ui';

import PagePathNav from '../PagePathNav';


import styles from './GrowiSubNavigation.module.scss';


export type GrowiSubNavigationProps = {
  pagePath?: string,
  pageId?: string,
  isNotFound?: boolean,
  isTagLabelsDisabled?: boolean,
  tags?: string[],
  rightComponent?: React.FunctionComponent,
  additionalClasses?: string[],
}

export const GrowiSubNavigation = (props: GrowiSubNavigationProps): JSX.Element => {

  const { data: editorMode } = useEditorMode();

  const {
    pageId, pagePath,
    rightComponent: RightComponent,
    additionalClasses = [],
  } = props;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;

  return (
    <div className={`
      grw-subnav ${styles['grw-subnav']} d-flex align-items-center justify-content-between
      ${additionalClasses.join(' ')}`}
    >
      {/* Left side */}
      <div className="d-flex grw-subnav-start-side">
        <div className="grw-path-nav-container">
          { pagePath != null && (
            <PagePathNav pageId={pageId} pagePath={pagePath} isSingleLineMode={isEditorMode} />
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
