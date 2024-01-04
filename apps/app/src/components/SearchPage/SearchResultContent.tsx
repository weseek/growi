import React, {
  type FC, useCallback, useRef,
} from 'react';

import { getIdForRef } from '@growi/core';
import type { IPageToDeleteWithMeta, IPageToRenameWithMeta } from '@growi/core';
import { useRenderedObserver } from '@growi/ui/dist/utils';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { animateScroll } from 'react-scroll';
import { DropdownItem } from 'reactstrap';

import { useShouldExpandContent } from '~/client/services/layout';
import { exportAsMarkdown, updateContentWidth } from '~/client/services/page-operation';
import { toastSuccess } from '~/client/util/toastr';
import type { IPageWithSearchMeta } from '~/interfaces/search';
import type { OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction } from '~/interfaces/ui';
import { useCurrentUser } from '~/stores/context';
import {
  usePageDuplicateModal, usePageRenameModal, usePageDeleteModal,
} from '~/stores/modal';
import { mutatePageList, mutatePageTree } from '~/stores/page-listing';
import { useSearchResultOptions } from '~/stores/renderer';
import { mutateSearching } from '~/stores/search';

import type { AdditionalMenuItemsRendererProps, ForceHideMenuItems } from '../Common/Dropdown/PageItemControl';
import { PagePathNav } from '../Common/PagePathNav';
import { type RevisionLoaderProps } from '../Page/RevisionLoader';
import { type PageCommentProps } from '../PageComment';
import type { PageContentFooterProps } from '../PageContentFooter';

import styles from './SearchResultContent.module.scss';

const moduleClass = styles['search-result-content'];
const _fluidLayoutClass = styles['fluid-layout'];


const PageControls = dynamic(() => import('../PageControls').then(mod => mod.PageControls), { ssr: false });
const RevisionLoader = dynamic<RevisionLoaderProps>(() => import('../Page/RevisionLoader').then(mod => mod.RevisionLoader), { ssr: false });
const PageComment = dynamic<PageCommentProps>(() => import('../PageComment').then(mod => mod.PageComment), { ssr: false });
const PageContentFooter = dynamic<PageContentFooterProps>(() => import('../PageContentFooter').then(mod => mod.PageContentFooter), { ssr: false });

type AdditionalMenuItemsProps = AdditionalMenuItemsRendererProps & {
  pageId: string,
  revisionId: string,
}

const AdditionalMenuItems = (props: AdditionalMenuItemsProps): JSX.Element => {
  const { t } = useTranslation();

  const { pageId, revisionId } = props;

  return (
    // Export markdown
    <DropdownItem
      onClick={() => exportAsMarkdown(pageId, revisionId, 'md')}
      className="grw-page-control-dropdown-item"
    >
      <i className="icon-fw icon-cloud-download grw-page-control-dropdown-icon"></i>
      {t('export_bulk.export_page_markdown')}
    </DropdownItem>
  );
};

const SCROLL_OFFSET_TOP = 30;

type Props ={
  pageWithMeta : IPageWithSearchMeta,
  highlightKeywords?: string[],
  showPageControlDropdown?: boolean,
  forceHideMenuItems?: ForceHideMenuItems,
}

const scrollToFirstHighlightedKeyword = (scrollElement: HTMLElement): void => {
  // use querySelector to intentionally get the first element found
  const toElem = scrollElement.querySelector('.highlighted-keyword') as HTMLElement | null;
  if (toElem == null) {
    return;
  }

  const distance = toElem.getBoundingClientRect().top - scrollElement.getBoundingClientRect().top - SCROLL_OFFSET_TOP;
  animateScroll.scrollMore(distance, {
    containerId: scrollElement.id,
    duration: 200,
  });
};
// const scrollToFirstHighlightedKeywordDebounced = debounce(500, scrollToFirstHighlightedKeyword);

export const SearchResultContent: FC<Props> = (props: Props) => {

  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Auto Scroll
  useRenderedObserver(scrollElementRef, {
    onRendered: () => {
      const scrollElement = scrollElementRef.current;
      if (scrollElement == null) return;

      scrollToFirstHighlightedKeyword(scrollElement);
    },
  });

  const {
    pageWithMeta,
    highlightKeywords,
    showPageControlDropdown,
    forceHideMenuItems,
  } = props;

  const { t } = useTranslation();

  const page = pageWithMeta?.data;
  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { open: openDeleteModal } = usePageDeleteModal();
  const { data: rendererOptions } = useSearchResultOptions(pageWithMeta.data.path, highlightKeywords);
  const { data: currentUser } = useCurrentUser();

  const shouldExpandContent = useShouldExpandContent(page);

  const duplicateItemClickedHandler = useCallback(async(pageToDuplicate) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const duplicatedHandler: OnDuplicatedFunction = (fromPath, toPath) => {
      toastSuccess(t('duplicated_pages', { fromPath }));

      mutatePageTree();
      mutateSearching();
      mutatePageList();
    };
    openDuplicateModal(pageToDuplicate, { onDuplicated: duplicatedHandler });
  }, [openDuplicateModal, t]);

  const renameItemClickedHandler = useCallback((pageToRename: IPageToRenameWithMeta) => {
    const renamedHandler: OnRenamedFunction = (path) => {
      toastSuccess(t('renamed_pages', { path }));

      mutatePageTree();
      mutateSearching();
      mutatePageList();
    };
    openRenameModal(pageToRename, { onRenamed: renamedHandler });
  }, [openRenameModal, t]);

  const onDeletedHandler: OnDeletedFunction = useCallback((pathOrPathsToDelete, isRecursively, isCompletely) => {
    if (typeof pathOrPathsToDelete !== 'string') {
      return;
    }
    const path = pathOrPathsToDelete;

    if (isCompletely) {
      toastSuccess(t('deleted_pages_completely', { path }));
    }
    else {
      toastSuccess(t('deleted_pages', { path }));
    }
    mutatePageTree();
    mutateSearching();
    mutatePageList();
  }, [t]);

  const deleteItemClickedHandler = useCallback((pageToDelete: IPageToDeleteWithMeta) => {
    openDeleteModal([pageToDelete], { onDeleted: onDeletedHandler });
  }, [onDeletedHandler, openDeleteModal]);

  const switchContentWidthHandler = useCallback(async(pageId: string, value: boolean) => {
    await updateContentWidth(pageId, value);

    // TODO: revalidate page data and update shouldExpandContent
  }, []);

  const RightComponent = useCallback(() => {
    if (page == null) {
      return <></>;
    }

    const revisionId = getIdForRef(page.revision);

    return (
      <div className="d-flex flex-column align-items-end justify-content-center px-2 py-1">
        <PageControls
          pageId={page._id}
          revisionId={revisionId}
          path={page.path}
          expandContentWidth={shouldExpandContent}
          showPageControlDropdown={showPageControlDropdown}
          forceHideMenuItems={forceHideMenuItems}
          additionalMenuItemRenderer={props => <AdditionalMenuItems {...props} pageId={page._id} revisionId={revisionId} />}
          onClickDuplicateMenuItem={duplicateItemClickedHandler}
          onClickRenameMenuItem={renameItemClickedHandler}
          onClickDeleteMenuItem={deleteItemClickedHandler}
          onClickSwitchContentWidth={switchContentWidthHandler}
        />
      </div>
    );
  }, [page, shouldExpandContent, showPageControlDropdown, forceHideMenuItems,
      duplicateItemClickedHandler, renameItemClickedHandler, deleteItemClickedHandler, switchContentWidthHandler]);

  const isRenderable = page != null && rendererOptions != null;

  const fluidLayoutClass = shouldExpandContent ? _fluidLayoutClass : '';

  return (
    <div
      key={page._id}
      data-testid="search-result-content"
      className={`dynamic-layout-root ${moduleClass} ${fluidLayoutClass}`}
    >
      <RightComponent />

      { isRenderable && (
        <div className="container-lg grw-container-convertible pt-2 pb-2">
          <PagePathNav pageId={page._id} pagePath={page.path} formerLinkClassName="small" latterLinkClassName="fs-3" />
        </div>
      ) }

      <div
        id="search-result-content-body-container"
        ref={scrollElementRef}
        className="search-result-content-body-container container-lg grw-container-convertible overflow-y-scroll"
      >
        { isRenderable && (
          <RevisionLoader
            rendererOptions={rendererOptions}
            pageId={page._id}
            revisionId={page.revision}
          />
        )}
        { isRenderable && (
          <PageComment
            rendererOptions={rendererOptions}
            pageId={page._id}
            pagePath={page.path}
            revision={page.revision}
            currentUser={currentUser}
            isReadOnly
          />
        )}
        { isRenderable && (
          <PageContentFooter
            page={page}
          />
        )}
      </div>
    </div>
  );
};
