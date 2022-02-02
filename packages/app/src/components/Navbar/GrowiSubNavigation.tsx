import React from 'react';

import { IPageHasId } from '~/interfaces/page';

import {
  EditorMode, useEditorMode,
} from '~/stores/ui';

import TagLabels from '../Page/TagLabels';

import AuthorInfo from './AuthorInfo';
import DrawerToggler from './DrawerToggler';

import PagePathNav from '../PagePathNav';
import { IUser } from '~/interfaces/user';


type Props = {
  page: Partial<IPageHasId>,

  showDrawerToggler?: boolean,
  showTagLabel?: boolean,
  showPageAuthors?: boolean,

  isGuestUser?: boolean,
  isDrawerMode?: boolean,
  isCompactMode?: boolean,

  tags?: string[],
  tagsUpdatedHandler?: (newTags: string[]) => Promise<void>,

  controls?: any,
}

export const GrowiSubNavigation = (props: Props): JSX.Element => {
  const { data: editorMode } = useEditorMode();

  const {
    page,
    showDrawerToggler, showTagLabel, showPageAuthors,
    isGuestUser, isDrawerMode, isCompactMode,
    tags, tagsUpdatedHandler,
    controls: Controls,
  } = props;

  const {
    _id: pageId, path, creator, lastUpdateUser,
    createdAt, updatedAt,
  } = page;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;

  if (path == null) {
    return <></>;
  }

  return (
    <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>

      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        { showDrawerToggler && isDrawerMode && (
          <div className={`d-none d-md-flex align-items-center ${isEditorMode ? 'mr-2 pr-2' : 'border-right mr-4 pr-4'}`}>
            <DrawerToggler />
          </div>
        ) }

        <div className="grw-path-nav-container">
          { showTagLabel && !isCompactMode && (
            <div className="grw-taglabels-container">
              <TagLabels tags={tags} isGuestUser={isGuestUser ?? false} tagsUpdateInvoked={tagsUpdatedHandler} />
            </div>
          ) }
          <PagePathNav pageId={pageId} pagePath={path} isSingleLineMode={isEditorMode} isCompactMode={isCompactMode} />
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">

        <div>
          <Controls></Controls>
        </div>

        {/* Page Authors */}
        { (showPageAuthors && !isCompactMode) && (
          <ul className="authors text-nowrap border-left d-none d-lg-block d-edit-none py-2 pl-4 mb-0 ml-3">
            <li className="pb-1">
              <AuthorInfo user={creator as IUser} date={createdAt} locate="subnav" />
            </li>
            <li className="mt-1 pt-1 border-top">
              <AuthorInfo user={lastUpdateUser as IUser} date={updatedAt} mode="update" locate="subnav" />
            </li>
          </ul>
        ) }
      </div>
    </div>
  );
};
