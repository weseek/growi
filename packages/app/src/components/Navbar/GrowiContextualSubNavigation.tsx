import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import { DropdownItem } from 'reactstrap';

import { withUnstatedContainers } from '../UnstatedUtils';
import EditorContainer from '~/client/services/EditorContainer';
import {
  EditorMode, useDrawerMode, useEditorMode, useIsDeviceSmallerThanMd, useIsAbleToShowPageManagement, useIsAbleToShowTagLabel,
  useIsAbleToShowPageEditorModeManager, useIsAbleToShowPageAuthors,
} from '~/stores/ui';
import {
  usePageAccessoriesModal, PageAccessoriesModalContents,
  usePageDuplicateModal, usePageRenameModal, usePageDeleteModal, usePagePresentationModal,
} from '~/stores/modal';


import {
  useCurrentCreatedAt, useCurrentUpdatedAt, useCurrentPageId, useRevisionId, useCurrentPagePath,
  useCreator, useRevisionAuthor, useCurrentUser, useIsGuestUser, useIsSharedUser, useShareLinkId,
} from '~/stores/context';
import { useSWRTagsInfo } from '~/stores/page';


import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import { IPageHasId } from '~/interfaces/page';

import HistoryIcon from '../Icons/HistoryIcon';
import AttachmentIcon from '../Icons/AttachmentIcon';
import ShareLinkIcon from '../Icons/ShareLinkIcon';
import { AdditionalMenuItemsRendererProps } from '../Common/Dropdown/PageItemControl';
import { SubNavButtons } from './SubNavButtons';
import PageEditorModeManager from './PageEditorModeManager';
import { GrowiSubNavigation } from './GrowiSubNavigation';
import PresentationIcon from '../Icons/PresentationIcon';
import CreateTemplateModal from '../CreateTemplateModal';
import { exportAsMarkdown } from '~/client/services/page-operation';


type AdditionalMenuItemsProps = AdditionalMenuItemsRendererProps & {
  pageId: string,
  revisionId: string,
  isLinkSharingDisabled?: boolean,
  onClickTemplateMenuItem: (isPageTemplateModalShown: boolean) => void,

}

const AdditionalMenuItems = (props: AdditionalMenuItemsProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    pageId, revisionId, isLinkSharingDisabled, onClickTemplateMenuItem,
  } = props;

  const openPageTemplateModalHandler = () => {
    onClickTemplateMenuItem(true);
  };

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();

  const { open: openPresentationModal } = usePagePresentationModal();
  const { open: openAccessoriesModal } = usePageAccessoriesModal();

  const hrefForPresentationModal = '?presentation=1';

  return (
    <>
      {/* Presentation */}
      <DropdownItem onClick={() => openPresentationModal(hrefForPresentationModal)}>
        <i className="icon-fw"><PresentationIcon /></i>
        { t('Presentation Mode') }
      </DropdownItem>

      {/* Export markdown */}
      <DropdownItem onClick={() => exportAsMarkdown(pageId, revisionId, 'md')}>
        <i className="icon-fw icon-cloud-download"></i>
        {t('export_bulk.export_page_markdown')}
      </DropdownItem>

      <DropdownItem divider />

      {/*
        TODO: show Tooltip when menu is disabled
        refs: PageAccessoriesModalControl
      */}
      <DropdownItem
        onClick={() => openAccessoriesModal(PageAccessoriesModalContents.PageHistory)}
        disabled={isGuestUser || isSharedUser}
      >
        <span className="mr-1"><HistoryIcon /></span>
        {t('History')}
      </DropdownItem>

      <DropdownItem
        onClick={() => openAccessoriesModal(PageAccessoriesModalContents.Attachment)}
      >
        <span className="mr-1"><AttachmentIcon /></span>
        {t('attachment_data')}
      </DropdownItem>

      <DropdownItem
        onClick={() => openAccessoriesModal(PageAccessoriesModalContents.ShareLink)}
        disabled={isGuestUser || isSharedUser || isLinkSharingDisabled}
      >
        <span className="mr-1"><ShareLinkIcon /></span>
        {t('share_links.share_link_management')}
      </DropdownItem>

      <DropdownItem divider />

      {/* Create template */}
      <DropdownItem onClick={openPageTemplateModalHandler}>
        <i className="icon-fw icon-magic-wand"></i> { t('template.option_label.create/edit') }
      </DropdownItem>
    </>
  );
};


const GrowiContextualSubNavigation = (props) => {
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { data: isDrawerMode } = useDrawerMode();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: createdAt } = useCurrentCreatedAt();
  const { data: updatedAt } = useCurrentUpdatedAt();
  const { data: pageId } = useCurrentPageId();
  const { data: revisionId } = useRevisionId();
  const { data: path } = useCurrentPagePath();
  const { data: creator } = useCreator();
  const { data: revisionAuthor } = useRevisionAuthor();
  const { data: currentUser } = useCurrentUser();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: shareLinkId } = useShareLinkId();

  const { data: isAbleToShowPageManagement } = useIsAbleToShowPageManagement();
  const { data: isAbleToShowTagLabel } = useIsAbleToShowTagLabel();
  const { data: isAbleToShowPageEditorModeManager } = useIsAbleToShowPageEditorModeManager();
  const { data: isAbleToShowPageAuthors } = useIsAbleToShowPageAuthors();

  const { mutate: mutateSWRTagsInfo, data: tagsInfoData } = useSWRTagsInfo(pageId);

  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { open: openDeleteModal } = usePageDeleteModal();

  const { t } = useTranslation();

  const [isPageTemplateModalShown, setIsPageTempleteModalShown] = useState(false);

  const {
    editorContainer, isCompactMode, isLinkSharingDisabled,
  } = props;

  const isViewMode = editorMode === EditorMode.View;

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

  const duplicateItemClickedHandler = useCallback(async(pageId, path) => {
    openDuplicateModal(pageId, path);
  }, [openDuplicateModal]);

  const renameItemClickedHandler = useCallback(async(pageId, revisionId, path) => {
    openRenameModal(pageId, revisionId, path);
  }, [openRenameModal]);


  const deleteItemClickedHandler = useCallback(async(pageToDelete, isAbleToDeleteCompletely) => {
    openDeleteModal([pageToDelete], isAbleToDeleteCompletely);
  }, [openDeleteModal]);

  const templateMenuItemClickHandler = useCallback(() => {
    setIsPageTempleteModalShown(true);
  }, []);


  const ControlComponents = useCallback(() => {
    function onPageEditorModeButtonClicked(viewType) {
      mutateEditorMode(viewType);
    }

    return (
      <>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
          { pageId != null && isViewMode && (
            <SubNavButtons
              isCompactMode={isCompactMode}
              pageId={pageId}
              shareLinkId={shareLinkId}
              revisionId={revisionId}
              path={path}
              disableSeenUserInfoPopover={isSharedUser}
              showPageControlDropdown={isAbleToShowPageManagement}
              additionalMenuItemRenderer={props => (
                <AdditionalMenuItems
                  {...props}
                  pageId={pageId}
                  revisionId={revisionId}
                  isLinkSharingDisabled={isLinkSharingDisabled}
                  onClickTemplateMenuItem={templateMenuItemClickHandler}
                />
              )}
              onClickDuplicateMenuItem={duplicateItemClickedHandler}
              onClickRenameMenuItem={renameItemClickedHandler}
              onClickDeleteMenuItem={deleteItemClickedHandler}
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
        {currentUser != null && (
          <CreateTemplateModal
            path={path}
            isOpen={isPageTemplateModalShown}
            onClose={() => setIsPageTempleteModalShown(false)}
          />
        )}
      </>
    );
  }, [
    pageId, revisionId, shareLinkId, editorMode, mutateEditorMode, isCompactMode,
    isLinkSharingDisabled, isDeviceSmallerThanMd, isGuestUser, isSharedUser, currentUser,
    isViewMode, isAbleToShowPageEditorModeManager, isAbleToShowPageManagement,
    duplicateItemClickedHandler, renameItemClickedHandler, deleteItemClickedHandler,
    path, templateMenuItemClickHandler, isPageTemplateModalShown,
  ]);


  if (path == null) {
    return <></>;
  }

  const currentPage: Partial<IPageHasId> = {
    _id: pageId ?? undefined,
    path,
    revision: revisionId ?? undefined,
    creator: creator ?? undefined,
    lastUpdateUser: revisionAuthor,
    createdAt: createdAt ?? undefined,
    updatedAt: updatedAt ?? undefined,
  };


  return (
    <GrowiSubNavigation
      page={currentPage}
      showDrawerToggler={isDrawerMode}
      showTagLabel={isAbleToShowTagLabel}
      showPageAuthors={isAbleToShowPageAuthors}
      isGuestUser={isGuestUser}
      isDrawerMode={isDrawerMode}
      isCompactMode={isCompactMode}
      tags={tagsInfoData?.tags || []}
      tagsUpdatedHandler={tagsUpdatedHandler}
      controls={ControlComponents}
    />
  );
};

/**
 * Wrapper component for using unstated
 */
const GrowiContextualSubNavigationWrapper = withUnstatedContainers(GrowiContextualSubNavigation, [EditorContainer]);


GrowiContextualSubNavigation.propTypes = {
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

  isCompactMode: PropTypes.bool,
  isLinkSharingDisabled: PropTypes.bool,
};

export default GrowiContextualSubNavigationWrapper;
