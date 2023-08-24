import React, { useState, useEffect, useCallback } from 'react';

import { isPopulated } from '@growi/core';
import type {
  IUser, IPagePopulatedToShowRevision,
  IPageToRenameWithMeta, IPageWithMeta, IPageInfoForEntity,
} from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { DropdownItem } from 'reactstrap';

import { exportAsMarkdown, updateContentWidth, useUpdateStateAfterSave } from '~/client/services/page-operation';
import { apiPost } from '~/client/util/apiv1-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction } from '~/interfaces/ui';
import {
  useCurrentPathname,
  useCurrentUser, useIsGuestUser, useIsReadOnlyUser, useIsSharedUser, useShareLinkId, useIsContainerFluid, useIsIdenticalPath,
} from '~/stores/context';
import { usePageTagsForEditors } from '~/stores/editor';
import {
  usePageAccessoriesModal, PageAccessoriesModalContents, IPageForPageDuplicateModal,
  usePageDuplicateModal, usePageRenameModal, usePageDeleteModal, usePagePresentationModal,
} from '~/stores/modal';
import {
  useSWRMUTxCurrentPage, useSWRxTagsInfo, useCurrentPageId, useIsNotFound, useTemplateTagData, useSWRxPageInfo,
} from '~/stores/page';
import { mutatePageTree } from '~/stores/page-listing';
import {
  EditorMode, useDrawerMode, useEditorMode, useIsAbleToShowPageManagement, useIsAbleToShowTagLabel,
  useIsAbleToChangeEditorMode, useIsAbleToShowPageAuthors,
} from '~/stores/ui';

import CreateTemplateModal from '../CreateTemplateModal';
import AttachmentIcon from '../Icons/AttachmentIcon';
import HistoryIcon from '../Icons/HistoryIcon';
import PresentationIcon from '../Icons/PresentationIcon';
import ShareLinkIcon from '../Icons/ShareLinkIcon';
import { NotAvailable } from '../NotAvailable';
import { Skeleton } from '../Skeleton';

import type { AuthorInfoProps } from './AuthorInfo';
import { GrowiSubNavigation } from './GrowiSubNavigation';
import type { SubNavButtonsProps } from './SubNavButtons';

import AuthorInfoStyles from './AuthorInfo.module.scss';
import PageEditorModeManagerStyles from './PageEditorModeManager.module.scss';

const AuthorInfoSkeleton = () => <Skeleton additionalClass={`${AuthorInfoStyles['grw-author-info-skeleton']} py-1`} />;


const PageEditorModeManager = dynamic(
  () => import('./PageEditorModeManager'),
  { ssr: false, loading: () => <Skeleton additionalClass={`${PageEditorModeManagerStyles['grw-page-editor-mode-manager-skeleton']}`} /> },
);
// TODO: If enable skeleton, we get hydration error when create a page from PageCreateModal
// { ssr: false, loading: () => <Skeleton additionalClass='btn-skeleton py-2' /> },
const SubNavButtons = dynamic<SubNavButtonsProps>(
  () => import('./SubNavButtons').then(mod => mod.SubNavButtons),
  { ssr: false, loading: () => <></> },
);
const AuthorInfo = dynamic<AuthorInfoProps>(() => import('./AuthorInfo').then(mod => mod.AuthorInfo), {
  ssr: false,
  loading: AuthorInfoSkeleton,
});

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
  isCompactMode?: boolean,
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

  const { data: isDrawerMode } = useDrawerMode();
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
  const { data: isAbleToShowTagLabel } = useIsAbleToShowTagLabel();
  const { data: isAbleToChangeEditorMode } = useIsAbleToChangeEditorMode();
  const { data: isAbleToShowPageAuthors } = useIsAbleToShowPageAuthors();

  const { mutate: mutateSWRTagsInfo, data: tagsInfoData } = useSWRxTagsInfo(currentPage?._id);

  // eslint-disable-next-line max-len
  const { data: tagsForEditors, mutate: mutatePageTagsForEditors, sync: syncPageTagsForEditors } = usePageTagsForEditors(!isSharedPage ? currentPage?._id : undefined);

  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { open: openDeleteModal } = usePageDeleteModal();
  const { data: templateTagData } = useTemplateTagData();
  const { mutate: mutatePageInfo } = useSWRxPageInfo(pageId);

  const updateStateAfterSave = useUpdateStateAfterSave(pageId);

  const path = currentPage?.path ?? currentPathname;

  useEffect(() => {
    // Run only when tagsInfoData has been updated
    if (templateTagData == null) {
      syncPageTagsForEditors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsInfoData?.tags]);

  useEffect(() => {
    if (pageId === null && templateTagData != null) {
      mutatePageTagsForEditors(templateTagData);
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
      await apiPost('/tags.update', { pageId, revisionId, tags: newTags });

      updateStateAfterSave?.();

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err);
    }

  }, [currentPage, updateStateAfterSave]);

  const tagsUpdatedHandlerForEditMode = useCallback((newTags: string[]): void => {
    // It will not be reflected in the DB until the page is refreshed
    mutatePageTagsForEditors(newTags);
    return;
  }, [mutatePageTagsForEditors]);

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
          <div className="d-flex flex-column align-items-end justify-content-center py-md-2" style={{ gap: `${isCompactMode ? '5px' : '7px'}` }}>
            {isViewMode && (
              <div className="h-50">
                {pageId != null && (
                  <SubNavButtons
                    isCompactMode={isCompactMode}
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
                onPageEditorModeButtonClicked={viewType => mutateEditorMode(viewType)}
                isBtnDisabled={!!isGuestUser || !!isReadOnlyUser}
                editorMode={editorMode}
              />
            )}
          </div>
          {(isAbleToShowPageAuthors && !isCompactMode && !pagePathUtils.isUsersHomepage(path ?? '')) && (
            <ul className={`${AuthorInfoStyles['grw-author-info']} text-nowrap border-start d-none d-lg-block d-edit-none py-2 pl-4 mb-0 ml-3`}>
              <li className="pb-1">
                {currentPage != null
                  ? <AuthorInfo user={currentPage.creator as IUser} date={currentPage.createdAt} mode="create" locate="subnav" />
                  : <AuthorInfoSkeleton />
                }
              </li>
              <li className="mt-1 pt-1 border-top">
                {currentPage != null
                  ? <AuthorInfo user={currentPage.lastUpdateUser as IUser} date={currentPage.updatedAt} mode="update" locate="subnav" />
                  : <AuthorInfoSkeleton />
                }
              </li>
            </ul>
          )}
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


  const pagePath = isIdenticalPath || isNotFound
    ? currentPathname
    : currentPage?.path;

  return (
    <GrowiSubNavigation
      pagePath={pagePath}
      pageId={currentPage?._id}
      showDrawerToggler={isDrawerMode}
      showTagLabel={isAbleToShowTagLabel}
      isTagLabelsDisabled={!!isGuestUser || !!isReadOnlyUser}
      isDrawerMode={isDrawerMode}
      isCompactMode={isCompactMode}
      tags={isViewMode ? tagsInfoData?.tags : tagsForEditors}
      tagsUpdatedHandler={isViewMode ? tagsUpdatedHandlerForViewMode : tagsUpdatedHandlerForEditMode}
      rightComponent={RightComponent}
      additionalClasses={['container-fluid']}
    />
  );
};


export default GrowiContextualSubNavigation;
