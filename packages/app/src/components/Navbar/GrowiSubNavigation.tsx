import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { IPageHasId } from '~/interfaces/page';
import { IUser } from '~/interfaces/user';
import {
  EditorMode, useEditorMode,
} from '~/stores/ui';

import { TagLabelsSkelton } from '../Page/TagLabels';
import PagePathNav from '../PagePathNav';
import { Skelton } from '../Skelton';

import DrawerToggler from './DrawerToggler';

import AuthorInfoStyles from './AuthorInfo.module.scss';
import styles from './GrowiSubNavigation.module.scss';

const TagLabels = dynamic(() => import('../Page/TagLabels').then(mod => mod.TagLabels), {
  ssr: false,
  loading: () => <TagLabelsSkelton />,
});
const AuthorInfo = dynamic(() => import('./AuthorInfo'), {
  ssr: false,
  loading: () => <Skelton additionalClass={`${AuthorInfoStyles['grw-author-info-skelton']} py-1`} />,
});


export type GrowiSubNavigationProps = {
  page: Partial<IPageHasId>,
  showDrawerToggler?: boolean,
  showTagLabel?: boolean,
  showPageAuthors?: boolean,
  isGuestUser?: boolean,
  isDrawerMode?: boolean,
  isCompactMode?: boolean,
  tags?: string[],
  tagsUpdatedHandler?: (newTags: string[]) => Promise<void> | void,
  controls: React.FunctionComponent,
  additionalClasses?: string[],
}

export const GrowiSubNavigation = (props: GrowiSubNavigationProps): JSX.Element => {

  const { data: editorMode } = useEditorMode();
  const [isControls, setControls] = useState(false);

  const {
    page,
    showDrawerToggler, showTagLabel, showPageAuthors,
    isGuestUser, isDrawerMode, isCompactMode,
    tags, tagsUpdatedHandler,
    controls: Controls,
    additionalClasses = [],
  } = props;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;
  const compactModeClasses = isCompactMode ? 'grw-subnav-compact d-print-none' : '';

  const {
    _id: pageId, path, creator, lastUpdateUser,
    createdAt, updatedAt,
  } = page;

  useEffect(() => {
    if (Controls != null) {
      setControls(true);
    }
  }, [Controls]);

  if (path == null) {
    return <></>;
  }

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
          <PagePathNav pageId={pageId} pagePath={path} isSingleLineMode={isEditorMode} isCompactMode={isCompactMode} />
        </div>
      </div>
      {/* Right side */}
      <div className="d-flex">
        { isControls && <Controls /> }
        {/* Page Authors */}
        { (showPageAuthors && !isCompactMode) && (
          <ul className={`${AuthorInfoStyles['grw-author-info']} text-nowrap border-left d-none d-lg-block d-edit-none py-2 pl-4 mb-0 ml-3`}>
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
