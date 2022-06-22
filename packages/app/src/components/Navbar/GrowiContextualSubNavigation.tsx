import React, { useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DropdownItem } from 'reactstrap';

import EditorContainer from '~/client/services/EditorContainer';
import { exportAsMarkdown } from '~/client/services/page-operation';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import {
  IPageHasId, IPageToRenameWithMeta, IPageWithMeta, IPageInfoForEntity,
} from '~/interfaces/page';
import { OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction } from '~/interfaces/ui';
import {
  useCurrentCreatedAt, useCurrentUpdatedAt, useCurrentPageId, useRevisionId, useCurrentPagePath,
  useCreator, useRevisionAuthor, useCurrentUser, useIsGuestUser, useIsSharedUser, useShareLinkId, useEmptyPageId,
} from '~/stores/context';
import {
  usePageAccessoriesModal, PageAccessoriesModalContents, IPageForPageDuplicateModal,
  usePageDuplicateModal, usePageRenameModal, usePageDeleteModal, usePagePresentationModal,
} from '~/stores/modal';
import { useSWRTagsInfo } from '~/stores/page';
import {
  EditorMode, useDrawerMode, useEditorMode, useIsDeviceSmallerThanMd, useIsAbleToShowPageManagement, useIsAbleToShowTagLabel,
  useIsAbleToShowPageEditorModeManager, useIsAbleToShowPageAuthors,
} from '~/stores/ui';

import { AdditionalMenuItemsRendererProps } from '../Common/Dropdown/PageItemControl';
import CreateTemplateModal from '../CreateTemplateModal';
import AttachmentIcon from '../Icons/AttachmentIcon';
import HistoryIcon from '../Icons/HistoryIcon';
import PresentationIcon from '../Icons/PresentationIcon';
import ShareLinkIcon from '../Icons/ShareLinkIcon';
import { withUnstatedContainers } from '../UnstatedUtils';


import { GrowiSubNavigation } from './GrowiSubNavigation';
import PageEditorModeManager from './PageEditorModeManager';
import { SubNavButtons } from './SubNavButtons';


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

  const hrefForPresentationModal = `${pageId}/?presentation=1`;

  return (
    <>
      {/* Presentation */}
      <DropdownItem
        onClick={() => openPresentationModal(hrefForPresentationModal)}
        data-testid="open-presentation-modal-btn"
        className="grw-page-control-dropdown-item"
      >
        <i className="icon-fw grw-page-control-dropdown-icon">
          <PresentationIcon />
        </i>
        { t('Presentation Mode') }
      </DropdownItem>

      {/* Export markdown */}
      <DropdownItem
        onClick={() => exportAsMarkdown(pageId, revisionId, 'md')}
        className="grw-page-control-dropdown-item"
      >
        <i className="icon-fw icon-cloud-download grw-page-control-dropdown-icon"></i>
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
        data-testid="open-page-accessories-modal-btn-with-history-tab"
        className="grw-page-control-dropdown-item"
      >
        <span className="grw-page-control-dropdown-icon">
          <HistoryIcon />
        </span>
        {t('History')}
      </DropdownItem>

      <DropdownItem
        onClick={() => openAccessoriesModal(PageAccessoriesModalContents.Attachment)}
        data-testid="open-page-accessories-modal-btn-with-attachment-data-tab"
        className="grw-page-control-dropdown-item"
      >
        <span className="grw-page-control-dropdown-icon">
          <AttachmentIcon />
        </span>
        {t('attachment_data')}
      </DropdownItem>

      <DropdownItem
        onClick={() => openAccessoriesModal(PageAccessoriesModalContents.ShareLink)}
        disabled={isGuestUser || isSharedUser || isLinkSharingDisabled}
        className="grw-page-control-dropdown-item"
      >
        <span className="grw-page-control-dropdown-icon">
          <ShareLinkIcon />
        </span>
        {t('share_links.share_link_management')}
      </DropdownItem>

      <DropdownItem divider />

      {/* Create template */}
      <DropdownItem
        onClick={openPageTemplateModalHandler}
        className="grw-page-control-dropdown-item"
        data-testid="open-page-template-modal-btn"
      >
        <i className="icon-fw icon-magic-wand grw-page-control-dropdown-icon"></i>
        { t('template.option_label.create/edit') }
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
  const { data: emptyPageId } = useEmptyPageId();
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

  const duplicateItemClickedHandler = useCallback(async(page: IPageForPageDuplicateModal) => {
    const duplicatedHandler: OnDuplicatedFunction = (fromPath, toPath) => {
      window.location.href = toPath;
    };
    openDuplicateModal(page, { onDuplicated: duplicatedHandler });
  }, [openDuplicateModal]);

  const renameItemClickedHandler = useCallback(async(page: IPageToRenameWithMeta<IPageInfoForEntity>) => {
    const renamedHandler: OnRenamedFunction = () => {
      if (page.data._id !== null) {
        window.location.href = `/${page.data._id}`;
        return;
      }
      window.location.reload();
    };
    openRenameModal(page, { onRenamed: renamedHandler });
  }, [openRenameModal]);

  const onDeletedHandler: OnDeletedFunction = useCallback((pathOrPathsToDelete, isRecursively, isCompletely) => {
    if (typeof pathOrPathsToDelete !== 'string') {
      return;
    }

    const path = pathOrPathsToDelete;

    if (isCompletely) {
      // redirect to NotFound Page
      window.location.href = path;
    }
    else {
      window.location.reload();
    }
  }, []);

  const deleteItemClickedHandler = useCallback((pageWithMeta: IPageWithMeta) => {
    openDeleteModal([pageWithMeta], { onDeleted: onDeletedHandler });
  }, [onDeletedHandler, openDeleteModal]);

  const templateMenuItemClickHandler = useCallback(() => {
    setIsPageTempleteModalShown(true);
  }, []);


  const ControlComponents = useCallback(() => {
    const pageIdForSubNavButtons = pageId ?? emptyPageId; // for SubNavButtons

    function onPageEditorModeButtonClicked(viewType) {
      mutateEditorMode(viewType);
    }

    let additionalMenuItemsRenderer;
    if (revisionId != null) {
      additionalMenuItemsRenderer = props => (
        <AdditionalMenuItems
          {...props}
          pageId={pageId}
          revisionId={revisionId}
          isLinkSharingDisabled={isLinkSharingDisabled}
          onClickTemplateMenuItem={templateMenuItemClickHandler}
        />
      );
    }
    return (
      <>
        <div className="d-flex flex-column align-items-end justify-content-center py-md-2" style={{ gap: `${isCompactMode ? '5px' : '7px'}` }}>
          { pageIdForSubNavButtons != null && isViewMode && (
            <div className="h-50">
              <SubNavButtons
                isCompactMode={isCompactMode}
                pageId={pageIdForSubNavButtons}
                shareLinkId={shareLinkId}
                revisionId={revisionId}
                path={path}
                disableSeenUserInfoPopover={isSharedUser}
                showPageControlDropdown={isAbleToShowPageManagement}
                additionalMenuItemRenderer={additionalMenuItemsRenderer}
                onClickDuplicateMenuItem={duplicateItemClickedHandler}
                onClickRenameMenuItem={renameItemClickedHandler}
                onClickDeleteMenuItem={deleteItemClickedHandler}
              />
            </div>
          ) }
          {isAbleToShowPageEditorModeManager && (
            <PageEditorModeManager
              onPageEditorModeButtonClicked={onPageEditorModeButtonClicked}
              isBtnDisabled={isGuestUser}
              editorMode={editorMode}
              isDeviceSmallerThanMd={isDeviceSmallerThanMd}
            />
          )}
        </div>
        {path != null && currentUser != null && (
          <CreateTemplateModal
            path={path}
            isOpen={isPageTemplateModalShown}
            onClose={() => setIsPageTempleteModalShown(false)}
          />
        )}
      </>
    );
  }, [
    pageId, emptyPageId, revisionId, shareLinkId, editorMode, mutateEditorMode, isCompactMode,
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
      additionalClasses={['container-fluid']}
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
