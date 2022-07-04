import React, { useState, useEffect, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { DropdownItem } from 'reactstrap';

import { exportAsMarkdown } from '~/client/services/page-operation';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import { getIdForRef, isPopulated } from '~/interfaces/common';
import {
  IPageHasId, IPageToRenameWithMeta, IPageWithMeta, IPageInfoForEntity,
} from '~/interfaces/page';
import { IResTagsUpdateApiv1 } from '~/interfaces/tag';
import { OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction } from '~/interfaces/ui';
import {
  useCurrentUser, useIsGuestUser,
} from '~/stores/context';
import { usePageTagsForEditors } from '~/stores/editor';
import {
  usePageAccessoriesModal, PageAccessoriesModalContents, IPageForPageDuplicateModal,
  usePageDuplicateModal, usePageRenameModal, usePageDeleteModal, usePagePresentationModal,
} from '~/stores/modal';
import { useSWRxCurrentPage, useSWRxTagsInfo } from '~/stores/page';
import {
  EditorMode, useDrawerMode, useEditorMode, useIsAbleToShowPageManagement, useIsAbleToShowTagLabel,
  useIsAbleToShowPageEditorModeManager, useIsAbleToShowPageAuthors,
} from '~/stores/ui';

import { AdditionalMenuItemsRendererProps } from '../Common/Dropdown/PageItemControl';
import CreateTemplateModal from '../CreateTemplateModal';
import AttachmentIcon from '../Icons/AttachmentIcon';
import HistoryIcon from '../Icons/HistoryIcon';
import PresentationIcon from '../Icons/PresentationIcon';
import ShareLinkIcon from '../Icons/ShareLinkIcon';


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
        disabled={isGuestUser}
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
        disabled={isGuestUser || isLinkSharingDisabled}
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

type GrowiContextualSubNavigationProps = {

  isCompactMode: boolean,
  isLinkSharingDisabled: boolean
}


const GrowiContextualSubNavigation = (props: GrowiContextualSubNavigationProps) => {

  const { data: pageData, mutate: mutateCurrentPage } = useSWRxCurrentPage();
  const pageId = pageData?._id;
  const createdAt = pageData?.createdAt;
  const updatedAt = pageData?.updatedAt;
  const path = pageData?.path;
  const creator = pageData?.creator;

  const revision = pageData?.revision;
  const revisionId = (revision != null && isPopulated(revision)) ? revision._id : undefined;
  const revisionAuthor = (revision != null && isPopulated(revision)) ? revision.author : undefined;

  const { data: isDrawerMode } = useDrawerMode();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: currentUser } = useCurrentUser();
  const { data: isGuestUser } = useIsGuestUser();

  const { data: isAbleToShowPageManagement } = useIsAbleToShowPageManagement();
  const { data: isAbleToShowTagLabel } = useIsAbleToShowTagLabel();
  const { data: isAbleToShowPageEditorModeManager } = useIsAbleToShowPageEditorModeManager();
  const { data: isAbleToShowPageAuthors } = useIsAbleToShowPageAuthors();

  const { mutate: mutateSWRTagsInfo, data: tagsInfoData } = useSWRxTagsInfo(pageId);
  const { data: tagsForEditors, mutate: mutatePageTagsForEditors, sync: syncPageTagsForEditors } = usePageTagsForEditors(pageId);

  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { open: openDeleteModal } = usePageDeleteModal();

  useEffect(() => {
    // Run only when tagsInfoData has been updated
    syncPageTagsForEditors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsInfoData?.tags]);

  const [isPageTemplateModalShown, setIsPageTempleteModalShown] = useState(false);

  const { isCompactMode, isLinkSharingDisabled } = props;

  const isViewMode = editorMode === EditorMode.View;


  const tagsUpdatedHandlerForViewMode = useCallback(async(newTags: string[]) => {
    try {
      const res: IResTagsUpdateApiv1 = await apiPost('/tags.update', { pageId, revisionId, tags: newTags });
      const updatedRevisionId = getIdForRef(res.savedPage.revision);
      // await pageContainer.setState({ revisionId: updatedRevisionId });
      // need to set revisionID
      mutateCurrentPage();

      // // revalidate SWRTagsInfo
      // mutateSWRTagsInfo();
      // mutatePageTagsForEditors(newTags);

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }

  }, [pageId, revisionId, mutateSWRTagsInfo, mutatePageTagsForEditors]);

  const tagsUpdatedHandlerForEditMode = useCallback((newTags: string[]): void => {
    // It will not be reflected in the DB until the page is refreshed
    mutatePageTagsForEditors(newTags);
    return;
  }, [mutatePageTagsForEditors]);

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
    const pageIdForSubNavButtons = pageId; // for SubNavButtons

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
                revisionId={revisionId}
                path={path}
                disableSeenUserInfoPopover={false}
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
    pageId, revisionId, editorMode, mutateEditorMode, isCompactMode,
    isLinkSharingDisabled, isGuestUser, currentUser,
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
      tags={isViewMode ? tagsInfoData?.tags : tagsForEditors}
      tagsUpdatedHandler={isViewMode ? tagsUpdatedHandlerForViewMode : tagsUpdatedHandlerForEditMode}
      controls={ControlComponents}
      additionalClasses={['container-fluid']}
    />
  );
};


export default GrowiContextualSubNavigation;
