import React, { useState, useCallback } from 'react';

import { isPopulated } from '@growi/core';
import type {
  IPagePopulatedToShowRevision,
  IPageToRenameWithMeta, IPageWithMeta, IPageInfoForEntity,
} from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { DropdownItem } from 'reactstrap';

import { exportAsMarkdown, updateContentWidth } from '~/client/services/page-operation';
import type { OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction } from '~/interfaces/ui';
import {
  useCurrentPathname,
  useCurrentUser, useIsGuestUser, useIsReadOnlyUser, useIsSharedUser, useShareLinkId, useIsContainerFluid, useIsIdenticalPath,
} from '~/stores/context';
import {
  usePageAccessoriesModal, PageAccessoriesModalContents, type IPageForPageDuplicateModal,
  usePageDuplicateModal, usePageRenameModal, usePageDeleteModal, usePagePresentationModal,
} from '~/stores/modal';
import {
  useSWRMUTxCurrentPage, useCurrentPageId, useIsNotFound, useSWRxPageInfo,
} from '~/stores/page';
import { mutatePageTree } from '~/stores/page-listing';
import {
  EditorMode, useEditorMode, useIsAbleToShowPageManagement,
  useIsAbleToChangeEditorMode,
} from '~/stores/ui';

import CreateTemplateModal from '../CreateTemplateModal';
import AttachmentIcon from '../Icons/AttachmentIcon';
import HistoryIcon from '../Icons/HistoryIcon';
import PresentationIcon from '../Icons/PresentationIcon';
import ShareLinkIcon from '../Icons/ShareLinkIcon';
import { NotAvailable } from '../NotAvailable';
import { Skeleton } from '../Skeleton';

import PageEditorModeManagerStyles from './PageEditorModeManager.module.scss';


const PageEditorModeManager = dynamic(
  () => import('./PageEditorModeManager').then(mod => mod.PageEditorModeManager),
  { ssr: false, loading: () => <Skeleton additionalClass={`${PageEditorModeManagerStyles['grw-page-editor-mode-manager-skeleton']}`} /> },
);
const PageControls = dynamic(
  () => import('../PageControls').then(mod => mod.PageControls),
  { ssr: false, loading: () => <></> },
);


type PageOperationMenuItemsProps = {
  pageId: string,
  revisionId: string,
  isLinkSharingDisabled?: boolean,
}

const PageOperationMenuItems = (props: PageOperationMenuItemsProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    pageId, revisionId, isLinkSharingDisabled,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: isSharedUser } = useIsSharedUser();

  const { open: openPresentationModal } = usePagePresentationModal();
  const { open: openAccessoriesModal } = usePageAccessoriesModal();

  return (
    <>
      {/* Presentation */}
      <DropdownItem
        onClick={() => openPresentationModal()}
        data-testid="open-presentation-modal-btn"
        className="grw-page-control-dropdown-item"
      >
        <i className="icon-fw grw-page-control-dropdown-icon">
          <PresentationIcon />
        </i>
        {t('Presentation Mode')}
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
        disabled={!!isGuestUser || !!isSharedUser}
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

      {!isGuestUser && !isReadOnlyUser && !isSharedUser && (
        <NotAvailable isDisabled={isLinkSharingDisabled ?? false} title="Disabled by admin">
          <DropdownItem
            onClick={() => openAccessoriesModal(PageAccessoriesModalContents.ShareLink)}
            data-testid="open-page-accessories-modal-btn-with-share-link-management-data-tab"
            className="grw-page-control-dropdown-item"
          >
            <span className="grw-page-control-dropdown-icon">
              <ShareLinkIcon />
            </span>
            {t('share_links.share_link_management')}
          </DropdownItem>
        </NotAvailable>
      )}
    </>
  );
};

type CreateTemplateMenuItemsProps = {
  onClickTemplateMenuItem: (isPageTemplateModalShown: boolean) => void,
}

const CreateTemplateMenuItems = (props: CreateTemplateMenuItemsProps): JSX.Element => {
  const { t } = useTranslation();

  const { onClickTemplateMenuItem } = props;

  const openPageTemplateModalHandler = () => {
    onClickTemplateMenuItem(true);
  };

  return (
    <>
      {/* Create template */}
      <DropdownItem
        onClick={openPageTemplateModalHandler}
        className="grw-page-control-dropdown-item"
        data-testid="open-page-template-modal-btn"
      >
        <i className="icon-fw icon-magic-wand grw-page-control-dropdown-icon"></i>
        {t('template.option_label.create/edit')}
      </DropdownItem>
    </>
  );
};

type GrowiContextualSubNavigationProps = {
  currentPage?: IPagePopulatedToShowRevision | null,
  isLinkSharingDisabled: boolean,
};

const GrowiContextualSubNavigation = (props: GrowiContextualSubNavigationProps): JSX.Element => {

  const { currentPage } = props;

  const router = useRouter();

  const { data: shareLinkId } = useShareLinkId();
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();

  const { data: currentPathname } = useCurrentPathname();
  const isSharedPage = pagePathUtils.isSharedPage(currentPathname ?? '');

  const revision = currentPage?.revision;
  const revisionId = (revision != null && isPopulated(revision)) ? revision._id : undefined;

  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: pageId } = useCurrentPageId();
  const { data: currentUser } = useCurrentUser();
  const { data: isNotFound } = useIsNotFound();
  const { data: isIdenticalPath } = useIsIdenticalPath();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: isContainerFluid } = useIsContainerFluid();

  const { data: isAbleToShowPageManagement } = useIsAbleToShowPageManagement();
  const { data: isAbleToChangeEditorMode } = useIsAbleToChangeEditorMode();

  // TODO: implement tags for editor
  // refs: https://redmine.weseek.co.jp/issues/132125
  // eslint-disable-next-line max-len
  // const { data: tagsForEditors, mutate: mutatePageTagsForEditors, sync: syncPageTagsForEditors } = usePageTagsForEditors(!isSharedPage ? currentPage?._id : undefined);
  // const { data: templateTagData } = useTemplateTagData();

  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { open: openDeleteModal } = usePageDeleteModal();
  const { mutate: mutatePageInfo } = useSWRxPageInfo(pageId);

  const path = currentPage?.path ?? currentPathname;

  // TODO: implement tags for editor
  // refs: https://redmine.weseek.co.jp/issues/132125
  // useEffect(() => {
  //   // Run only when tagsInfoData has been updated
  //   if (templateTagData == null) {
  //     syncPageTagsForEditors();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [tagsInfoData?.tags]);

  // TODO: implement tags for editor
  // refs: https://redmine.weseek.co.jp/issues/132125
  // useEffect(() => {
  //   if (pageId === null && templateTagData != null) {
  //     mutatePageTagsForEditors(templateTagData);
  //   }
  // }, [pageId, mutatePageTagsForEditors, templateTagData, mutateSWRTagsInfo]);

  const [isPageTemplateModalShown, setIsPageTempleteModalShown] = useState(false);

  const { isLinkSharingDisabled } = props;

  const isViewMode = editorMode === EditorMode.View;


  // TODO: implement tags for editor
  // refs: https://redmine.weseek.co.jp/issues/132125
  // const tagsUpdatedHandlerForEditMode = useCallback((newTags: string[]): void => {
  //   // It will not be reflected in the DB until the page is refreshed
  //   mutatePageTagsForEditors(newTags);
  //   return;
  // }, [mutatePageTagsForEditors]);

  const duplicateItemClickedHandler = useCallback(async(page: IPageForPageDuplicateModal) => {
    const duplicatedHandler: OnDuplicatedFunction = (fromPath, toPath) => {
      router.push(toPath);
    };
    openDuplicateModal(page, { onDuplicated: duplicatedHandler });
  }, [openDuplicateModal, router]);

  const renameItemClickedHandler = useCallback(async(page: IPageToRenameWithMeta<IPageInfoForEntity>) => {
    const renamedHandler: OnRenamedFunction = () => {
      mutateCurrentPage();
      mutatePageInfo();
      mutatePageTree();
    };
    openRenameModal(page, { onRenamed: renamedHandler });
  }, [mutateCurrentPage, mutatePageInfo, openRenameModal]);

  const deleteItemClickedHandler = useCallback((pageWithMeta: IPageWithMeta) => {
    const deletedHandler: OnDeletedFunction = (pathOrPathsToDelete, isRecursively, isCompletely) => {
      if (typeof pathOrPathsToDelete !== 'string') {
        return;
      }

      const path = pathOrPathsToDelete;

      if (isCompletely) {
        // redirect to NotFound Page
        router.push(path);
      }
      else if (currentPathname != null) {
        router.push(currentPathname);
      }

      mutateCurrentPage();
      mutatePageInfo();
      mutatePageTree();
    };
    openDeleteModal([pageWithMeta], { onDeleted: deletedHandler });
  }, [currentPathname, mutateCurrentPage, openDeleteModal, router, mutatePageInfo]);

  const switchContentWidthHandler = useCallback(async(pageId: string, value: boolean) => {
    if (!isSharedPage) {
      await updateContentWidth(pageId, value);
      mutateCurrentPage();
    }
  }, [isSharedPage, mutateCurrentPage]);

  const templateMenuItemClickHandler = useCallback(() => {
    setIsPageTempleteModalShown(true);
  }, []);


  const RightComponent = () => {
    const additionalMenuItemsRenderer = () => {
      if (revisionId == null || pageId == null) {
        return (
          <>
            {!isReadOnlyUser
              && (
                <CreateTemplateMenuItems
                  onClickTemplateMenuItem={templateMenuItemClickHandler}
                />
              )
            }
          </>
        );
      }
      return (
        <>
          <PageOperationMenuItems
            pageId={pageId}
            revisionId={revisionId}
            isLinkSharingDisabled={isLinkSharingDisabled}
          />
          {!isReadOnlyUser && (
            <>
              <DropdownItem divider />
              <CreateTemplateMenuItems
                onClickTemplateMenuItem={templateMenuItemClickHandler}
              />
            </>
          )
          }
        </>
      );
    };

    return (
      <>
        <div className="d-flex">
          <div className="d-flex flex-column align-items-end justify-content-center py-md-2" style={{ gap: '7px' }}>
            {isViewMode && (
              <div className="h-50">
                {pageId != null && (
                  <PageControls
                    pageId={pageId}
                    revisionId={revisionId}
                    shareLinkId={shareLinkId}
                    path={path ?? currentPathname} // If the page is empty, "path" is undefined
                    expandContentWidth={currentPage?.expandContentWidth ?? isContainerFluid}
                    disableSeenUserInfoPopover={isSharedUser}
                    showPageControlDropdown={isAbleToShowPageManagement}
                    additionalMenuItemRenderer={additionalMenuItemsRenderer}
                    onClickDuplicateMenuItem={duplicateItemClickedHandler}
                    onClickRenameMenuItem={renameItemClickedHandler}
                    onClickDeleteMenuItem={deleteItemClickedHandler}
                    onClickSwitchContentWidth={switchContentWidthHandler}
                  />
                )}
              </div>
            )}
            {isAbleToChangeEditorMode && (
              <PageEditorModeManager
                editorMode={editorMode}
                isBtnDisabled={!!isGuestUser || !!isReadOnlyUser}
                onPageEditorModeButtonClicked={viewType => mutateEditorMode(viewType)}
              />
            )}
          </div>

        </div>

        {path != null && currentUser != null && !isReadOnlyUser && (
          <CreateTemplateModal
            path={path}
            isOpen={isPageTemplateModalShown}
            onClose={() => setIsPageTempleteModalShown(false)}
          />
        )}
      </>
    );
  };


  return (
    <RightComponent />
  );
};


export default GrowiContextualSubNavigation;
