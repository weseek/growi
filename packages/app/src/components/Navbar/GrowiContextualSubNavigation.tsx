import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import EditorContainer from '~/client/services/EditorContainer';
import {
  EditorMode, useDrawerMode, useEditorMode, useIsDeviceSmallerThanMd, useIsAbleToShowPageManagement, useIsAbleToShowTagLabel,
  useIsAbleToShowPageEditorModeManager, useIsAbleToShowPageAuthors,
} from '~/stores/ui';
import {
  useCurrentCreatedAt, useCurrentUpdatedAt, useCurrentPageId, useRevisionId, useCurrentPagePath, useIsDeletable,
  useIsAbleToDeleteCompletely, useCreator, useRevisionAuthor, useIsGuestUser,
} from '~/stores/context';
import { useSWRTagsInfo } from '~/stores/page';

import TagLabels from '../Page/TagLabels';
import SubNavButtons from './SubNavButtons';
import PageEditorModeManager from './PageEditorModeManager';

import AuthorInfo from './AuthorInfo';
import DrawerToggler from './DrawerToggler';

import PagePathNav from '../PagePathNav';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';

const GrowiContextualSubNavigation = (props) => {
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { data: isDrawerMode } = useDrawerMode();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: createdAt } = useCurrentCreatedAt();
  const { data: updatedAt } = useCurrentUpdatedAt();
  const { data: pageId } = useCurrentPageId();
  const { data: revisionId } = useRevisionId();
  const { data: path } = useCurrentPagePath();
  const { data: isDeletable } = useIsDeletable();
  const { data: isAbleToDeleteCompletely } = useIsAbleToDeleteCompletely();
  const { data: creator } = useCreator();
  const { data: revisionAuthor } = useRevisionAuthor();
  const { data: isGuestUser } = useIsGuestUser();

  const { data: isAbleToShowPageManagement } = useIsAbleToShowPageManagement();
  const { data: isAbleToShowTagLabel } = useIsAbleToShowTagLabel();
  const { data: isAbleToShowPageEditorModeManager } = useIsAbleToShowPageEditorModeManager();
  const { data: isAbleToShowPageAuthors } = useIsAbleToShowPageAuthors();

  const { mutate: mutateSWRTagsInfo, data: TagsInfoData } = useSWRTagsInfo(pageId);

  const {
    editorContainer, isCompactMode,
  } = props;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;
  const isPageExist = pageId != null;

  function onPageEditorModeButtonClicked(viewType) {
    mutateEditorMode(viewType);
  }

  const tagsUpdatedHandler = useCallback(async(newTags: string[]) => {
    // It will not be reflected in the DB until the page is refreshed
    if (editorMode === EditorMode.Editor) {
      return editorContainer.setState({ tags: newTags });
    }

    try {
      const { tags } = await apiPost('/tags.update', { pageId, revisionId, tags: newTags }) as { tags };

      // revalidate SWRTagsInfo
      mutateSWRTagsInfo();
      // update editorContainer.state
      editorContainer.setState({ tags });

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  if (path == null) {
    return <></>;
  }

  return (
    <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>

      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        { isDrawerMode && (
          <div className={`d-none d-md-flex align-items-center ${isEditorMode ? 'mr-2 pr-2' : 'border-right mr-4 pr-4'}`}>
            <DrawerToggler />
          </div>
        ) }

        <div className="grw-path-nav-container">
          { isAbleToShowTagLabel && !isCompactMode && (
            <div className="grw-taglabels-container">
              <TagLabels tags={TagsInfoData?.tags || []} isGuestUser={isGuestUser ?? false} tagsUpdateInvoked={tagsUpdatedHandler} />
            </div>
          ) }
          <PagePathNav pageId={pageId} pagePath={path} isSingleLineMode={isEditorMode} isCompactMode={isCompactMode} />
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">

        <div>
          <div className="h-50 d-flex flex-column align-items-end justify-content-center">
            { isPageExist && (
              <SubNavButtons
                isCompactMode={isCompactMode}
                pageId={pageId}
                revisionId={revisionId}
                path={path}
                isDeletable={isDeletable}
                isAbleToDeleteCompletely={isAbleToDeleteCompletely}
                isViewMode={isViewMode}
                isAbleToShowPageManagement={isAbleToShowPageManagement}
              />
            ) }
          </div>
          <div className="h-50 d-flex flex-column align-items-end justify-content-center">
            {isAbleToShowPageEditorModeManager && (
              <PageEditorModeManager
                onPageEditorModeButtonClicked={onPageEditorModeButtonClicked}
                isBtnDisabled={isGuestUser}
                editorMode={editorMode}
                isDeviceSmallerThanMd={isDeviceSmallerThanMd}
              />
            )}
          </div>
        </div>

        {/* Page Authors */}
        { (isAbleToShowPageAuthors && !isCompactMode) && (
          <ul className="authors text-nowrap border-left d-none d-lg-block d-edit-none py-2 pl-4 mb-0 ml-3">
            <li className="pb-1">
              <AuthorInfo user={creator} date={createdAt} locate="subnav" />
            </li>
            <li className="mt-1 pt-1 border-top">
              <AuthorInfo user={revisionAuthor} date={updatedAt} mode="update" locate="subnav" />
            </li>
          </ul>
        ) }
      </div>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const GrowiContextualSubNavigationWrapper = withUnstatedContainers(GrowiContextualSubNavigation, [EditorContainer]);


GrowiContextualSubNavigation.propTypes = {
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

  isCompactMode: PropTypes.bool,
};

export default GrowiContextualSubNavigationWrapper;
