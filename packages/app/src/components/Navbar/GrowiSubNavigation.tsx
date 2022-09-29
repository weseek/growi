import React from 'react';

import { pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';

import {
  EditorMode, useEditorMode,
} from '~/stores/ui';

import { TagLabelsSkelton } from '../Page/TagLabels';
import PagePathNav from '../PagePathNav';
import { Skelton } from '../Skelton';

import DrawerToggler from './DrawerToggler';

// import AuthorInfoStyles from './AuthorInfo.module.scss';
import styles from './GrowiSubNavigation.module.scss';


const { isPermalink } = pagePathUtils;


// const AuthorInfoSkelton = () => <Skelton additionalClass={`${AuthorInfoStyles['grw-author-info-skelton']} py-1`} />;

const TagLabels = dynamic(() => import('../Page/TagLabels').then(mod => mod.TagLabels), {
  ssr: false,
  loading: TagLabelsSkelton,
});
// const AuthorInfo = dynamic(() => import('./AuthorInfo'), {
//   ssr: false,
//   loading: AuthorInfoSkelton,
// });


export type GrowiSubNavigationProps = {
  pagePath?: string,
  pageId?: string,
  isNotFound?: boolean,
  showDrawerToggler?: boolean,
  showTagLabel?: boolean,
  showPageAuthors?: boolean,
  isGuestUser?: boolean,
  isDrawerMode?: boolean,
  isCompactMode?: boolean,
  tags?: string[],
  tagsUpdatedHandler?: (newTags: string[]) => Promise<void> | void,
  rightComponent: React.FunctionComponent,
  additionalClasses?: string[],
}

export const GrowiSubNavigation = (props: GrowiSubNavigationProps): JSX.Element => {

  const { data: editorMode } = useEditorMode();

  const {
    pageId, pagePath,
    showDrawerToggler, showTagLabel,
    isGuestUser, isDrawerMode, isCompactMode,
    tags, tagsUpdatedHandler,
    rightComponent: RightComponent,
    additionalClasses = [],
  } = props;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;
  const compactModeClasses = isCompactMode ? 'grw-subnav-compact d-print-none' : '';

  return (
    <div className={`grw-subnav ${styles['grw-subnav']} d-flex align-items-center justify-content-between ${additionalClasses.join(' ')}
    ${compactModeClasses}`} >
      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        { (showDrawerToggler && isDrawerMode) && (
          <div className={`d-none d-md-flex align-items-center ${isEditorMode ? 'mr-2 pr-2' : 'border-right mr-4 pr-4'}`}>
            <DrawerToggler />
          </div>
        ) }
        <div className="grw-path-nav-container">
          { (showTagLabel && !isCompactMode) && (
            <div className="grw-taglabels-container">
              <TagLabels tags={tags} isGuestUser={isGuestUser ?? false} tagsUpdateInvoked={tagsUpdatedHandler} />
            </div>
          ) }
          { pagePath != null && !isPermalink(pagePath)
            ? <PagePathNav pageId={pageId} pagePath={pagePath} isSingleLineMode={isEditorMode} isCompactMode={isCompactMode} />
            : <Skelton />
          }
        </div>
      </div>
      {/* Right side. */}
      <RightComponent />
      {/*
      <div className="d-flex">
        <Controls />
        { (showPageAuthors && !isCompactMode) && (
          <ul className={`${AuthorInfoStyles['grw-author-info']} text-nowrap border-left d-none d-lg-block d-edit-none py-2 pl-4 mb-0 ml-3`}>
            <li className="pb-1">
              { page != null
                ? <AuthorInfo user={page.creator as IUser} date={page.createdAt} locate="subnav" />
                : <AuthorInfoSkelton />
              }
            </li>
            <li className="mt-1 pt-1 border-top">
              { page != null
                ? <AuthorInfo user={page.lastUpdateUser as IUser} date={page.updatedAt} mode="update" locate="subnav" />
                : <AuthorInfoSkelton />
              }
            </li>
          </ul>
        ) }
      </div>
      */}
    </div>
  );
};
