import React from 'react';

import dynamic from 'next/dynamic';

import {
  EditorMode, useEditorMode,
} from '~/stores/ui';

import { TagLabelsSkeleton } from '../Page/TagLabels';
import PagePathNav from '../PagePathNav';

import DrawerToggler from './DrawerToggler';


import styles from './GrowiSubNavigation.module.scss';


const TagLabels = dynamic(() => import('../Page/TagLabels').then(mod => mod.TagLabels), {
  ssr: false,
  loading: TagLabelsSkeleton,
});


export type GrowiSubNavigationProps = {
  pagePath?: string,
  pageId?: string,
  isNotFound?: boolean,
  showDrawerToggler?: boolean,
  showTagLabel?: boolean,
  isTagLabelsDisabled?: boolean,
  isDrawerMode?: boolean,
  isCompactMode?: boolean,
  tags?: string[],
  tagsUpdatedHandler?: (newTags: string[]) => Promise<void> | void,
  rightComponent?: React.FunctionComponent,
  additionalClasses?: string[],
}

export const GrowiSubNavigation = (props: GrowiSubNavigationProps): JSX.Element => {

  const { data: editorMode } = useEditorMode();

  const {
    pageId, pagePath,
    showDrawerToggler, showTagLabel,
    isTagLabelsDisabled, isDrawerMode, isCompactMode,
    tags, tagsUpdatedHandler,
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
          <div className={`d-none d-md-flex align-items-center ${isEditorMode ? 'me-2 pr-2' : 'border-end me-4 pr-4'}`}>
            <DrawerToggler />
          </div>
        ) }
        <div className="grw-path-nav-container">
          { (showTagLabel && !isCompactMode) && (
            <div className="grw-taglabels-container">
              { tags != null
                ? <TagLabels tags={tags} isTagLabelsDisabled={isTagLabelsDisabled ?? false} tagsUpdateInvoked={tagsUpdatedHandler} />
                : <TagLabelsSkeleton />
              }
            </div>
          ) }
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
