import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import NavigationContainer from '~/client/services/NavigationContainer';
import PageContainer from '~/client/services/PageContainer';
import EditorContainer from '~/client/services/EditorContainer';

import TagLabels from '../Page/TagLabels';
import SubNavButtons from './SubNavButtons';
import PageEditorModeManager from './PageEditorModeManager';

import AuthorInfo from './AuthorInfo';
import DrawerToggler from './DrawerToggler';

import PagePathNav from '../PagePathNav';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';

const GrowiSubNavigation = (props) => {
  const {
    appContainer, navigationContainer, pageContainer, editorContainer, isCompactMode,
  } = props;
  const { isDrawerMode, editorMode, isDeviceSmallerThanMd } = navigationContainer.state;
  const {
    pageId,
    revisionId,
    path,
    isDeletable,
    isAbleToDeleteCompletely,
    createdAt,
    creator,
    updatedAt,
    revisionAuthor,
    isPageExist,
    isTrashPage,
    tags,
  } = pageContainer.state;

  const { isGuestUser, isSharedUser } = appContainer;
  const isEditorMode = editorMode !== 'view';
  // Tags cannot be edited while the new page and editorMode is view
  const isTagLabelHidden = (editorMode !== 'edit' && !isPageExist);

  const isAbleToShowPageManagement = isPageExist && !isTrashPage && !isSharedUser;
  function onPageEditorModeButtonClicked(viewType) {
    navigationContainer.setEditorMode(viewType);
  }

  const tagsUpdatedHandler = useCallback(async(newTags) => {
    // It will not be reflected in the DB until the page is refreshed
    if (editorMode === 'edit') {
      return editorContainer.setState({ tags: newTags });
    }

    try {
      const { tags } = await apiPost('/tags.update', { pageId, tags: newTags });

      // update pageContainer.state
      pageContainer.setState({ tags });
      // update editorContainer.state
      editorContainer.setState({ tags });

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

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
          { pageContainer.isAbleToShowTagLabel && !isCompactMode && !isTagLabelHidden && (
            <div className="grw-taglabels-container">
              <TagLabels tags={tags} tagsUpdateInvoked={tagsUpdatedHandler} />
            </div>
          ) }
          <PagePathNav pageId={pageId} pagePath={path} isSingleLineMode={isEditorMode} isCompactMode={isCompactMode} />
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">

        <div className="d-flex flex-column align-items-end">
          <div className="d-flex">
            <SubNavButtons
              isCompactMode={isCompactMode}
              pageId={pageId}
              revisionId={revisionId}
              path={path}
              isDeletable={isDeletable}
              isAbleToDeleteCompletely={isAbleToDeleteCompletely}
              willShowPageManagement={isAbleToShowPageManagement}
            />
          </div>
          <div className="mt-2">
            {pageContainer.isAbleToShowPageEditorModeManager && (
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
        { (pageContainer.isAbleToShowPageAuthors && !isCompactMode) && (
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
const GrowiSubNavigationWrapper = withUnstatedContainers(GrowiSubNavigation, [AppContainer, NavigationContainer, PageContainer, EditorContainer]);


GrowiSubNavigation.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

  isCompactMode: PropTypes.bool,
};

export default GrowiSubNavigationWrapper;
