import React, { useState, useEffect, useCallback } from 'react';

import { isPopulated } from '@growi/core';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { DropdownItem } from 'reactstrap';

import { exportAsMarkdown } from '~/client/services/page-operation';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import {
  IPageToRenameWithMeta, IPageWithMeta, IPageInfoForEntity, IPageHasId,
} from '~/interfaces/page';
import { OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction } from '~/interfaces/ui';
import { IUser } from '~/interfaces/user';
import {
  useCurrentPageId,
  useCurrentPathname,
  useCurrentUser, useIsGuestUser, useIsSharedUser, useShareLinkId, useTemplateTagData,
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

import CreateTemplateModal from '../CreateTemplateModal';
import AttachmentIcon from '../Icons/AttachmentIcon';
import HistoryIcon from '../Icons/HistoryIcon';
import PresentationIcon from '../Icons/PresentationIcon';
import ShareLinkIcon from '../Icons/ShareLinkIcon';
import { Skelton } from '../Skelton';

import { GrowiSubNavigation } from './GrowiSubNavigation';
import { SubNavButtonsProps } from './SubNavButtons';

import { IResTagsUpdateApiv1 } from '~interfaces/tag';

import PageEditorModeManagerStyles from './PageEditorModeManager.module.scss';


type AdditionalMenuItemsProps = {
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
        data-testid="open-page-accessories-modal-btn-with-share-link-management-data-tab"
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
  isCompactMode?: boolean,
  isLinkSharingDisabled: boolean,
};

const GrowiContextualSubNavigation = (props: GrowiContextualSubNavigationProps): JSX.Element => {

  const PageEditorModeManager = dynamic(
    () => import('./PageEditorModeManager'),
    { ssr: false, loading: () => <Skelton additionalClass={`${PageEditorModeManagerStyles['grw-page-editor-mode-manager-skelton']}`} /> },
  );
  const SubNavButtons = dynamic<SubNavButtonsProps>(
    () => import('./SubNavButtons').then(mod => mod.SubNavButtons),
    { ssr: false, loading: () => <Skelton additionalClass='btn-skelton py-2' /> },
  );

  const { data: currentPage, mutate: mutateCurrentPage } = useSWRxCurrentPage();
  const path = currentPage?.path;

  const revision = currentPage?.revision;
  const revisionId = (revision != null && isPopulated(revision)) ? revision._id : undefined;

  const { data: isDrawerMode } = useDrawerMode();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: pageId } = useCurrentPageId();
  const { data: currentPathname } = useCurrentPathname();
  const { data: currentUser } = useCurrentUser();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: shareLinkId } = useShareLinkId();

  const { data: isAbleToShowPageManagement } = useIsAbleToShowPageManagement();
  const { data: isAbleToShowTagLabel } = useIsAbleToShowTagLabel();
  const { data: isAbleToShowPageEditorModeManager } = useIsAbleToShowPageEditorModeManager();
  const { data: isAbleToShowPageAuthors } = useIsAbleToShowPageAuthors();

  const { mutate: mutateSWRTagsInfo, data: tagsInfoData } = useSWRxTagsInfo(currentPage?._id);
  const { data: tagsForEditors, mutate: mutatePageTagsForEditors, sync: syncPageTagsForEditors } = usePageTagsForEditors(currentPage?._id);

  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { open: openDeleteModal } = usePageDeleteModal();
  const { data: templateTagData } = useTemplateTagData();


  useEffect(() => {
    // Run only when tagsInfoData has been updated
    if (templateTagData == null) {
      syncPageTagsForEditors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsInfoData?.tags]);

  useEffect(() => {
    if (pageId === null && templateTagData != null) {
      const tags = templateTagData.split(',').filter((str: string) => {
        return str !== ''; // filter empty values
      });
      mutatePageTagsForEditors(tags);
    }
  }, [pageId, mutatePageTagsForEditors, templateTagData, mutateSWRTagsInfo]);

  const [isPageTemplateModalShown, setIsPageTempleteModalShown] = useState(false);

  const { isCompactMode, isLinkSharingDisabled } = props;

  const isViewMode = editorMode === EditorMode.View;


  const tagsUpdatedHandlerForViewMode = useCallback(async(newTags: string[]) => {
    if (currentPage == null) {
      return;
    }

    const { _id: pageId, revision: revisionId } = currentPage;
    try {
      const res: IResTagsUpdateApiv1 = await apiPost('/tags.update', { pageId, revisionId, tags: newTags });
      mutateCurrentPage();

      // TODO: fix https://github.com/weseek/growi/pull/6478 without pageContainer
      // const lastUpdateUser = res.savedPage?.lastUpdateUser as IUser;
      // await pageContainer.setState({ lastUpdateUsername: lastUpdateUser.username });

      // revalidate SWRTagsInfo
      mutateSWRTagsInfo();
      mutatePageTagsForEditors(newTags);

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }

  }, [mutateSWRTagsInfo, mutatePageTagsForEditors, mutateCurrentPage, pageId, revisionId]);

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
    if (currentPage == null || pageId == null) {
      return <></>;
    }

    function onPageEditorModeButtonClicked(viewType) {
      mutateEditorMode(viewType);
    }

    const additionalMenuItemsRenderer = () => {
      if (revisionId == null || pageId == null) {
        return <></>;
      }
      return (
        <AdditionalMenuItems
          pageId={pageId}
          revisionId={revisionId}
          isLinkSharingDisabled={isLinkSharingDisabled}
          onClickTemplateMenuItem={templateMenuItemClickHandler}
        />
      );
    };
    return (
      <>
        <div className="d-flex flex-column align-items-end justify-content-center py-md-2" style={{ gap: `${isCompactMode ? '5px' : '7px'}` }}>

          { isViewMode && (
            <div className="h-50 w-100">
              <SubNavButtons
                isCompactMode={isCompactMode}
                pageId={pageId}
                revisionId={revisionId}
                shareLinkId={shareLinkId}
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
    isLinkSharingDisabled, isGuestUser, isSharedUser, currentUser,
    isViewMode, isAbleToShowPageEditorModeManager, isAbleToShowPageManagement,
    duplicateItemClickedHandler, renameItemClickedHandler, deleteItemClickedHandler,
    templateMenuItemClickHandler, isPageTemplateModalShown,
  ]);

  if (currentPathname == null) {
    return <></>;
  }

  const notFoundPage: Partial<IPageHasId> = {
    path: currentPathname,
  };

  return (
    <GrowiSubNavigation
      page={currentPage ?? notFoundPage}
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
