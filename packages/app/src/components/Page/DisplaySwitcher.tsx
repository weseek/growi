import React, { useMemo } from 'react';

import { pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

// import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import {
  useCurrentPagePath, useIsSharedUser, useIsEditable, useIsUserPage, usePageUser, useShareLinkId, useIsNotFound,
} from '~/stores/context';
import { useDescendantsPageListModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';

import CountBadge from '../Common/CountBadge';
import CustomTabContent from '../CustomNavigation/CustomTabContent';
import PageListIcon from '../Icons/PageListIcon';
import { Page } from '../Page';
// import PageEditorByHackmd from '../PageEditorByHackmd';
import TableOfContents from '../TableOfContents';
import { UserInfoProps } from '../User/UserInfo';


import styles from './DisplaySwitcher.module.scss';


const { isTopPage } = pagePathUtils;


const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
const EditorNavbarBottom = dynamic(() => import('../PageEditor/EditorNavbarBottom'), { ssr: false });
const HashChanged = dynamic(() => import('../EventListeneres/HashChanged'), { ssr: false });
const ContentLinkButtons = dynamic(() => import('../ContentLinkButtons'), { ssr: false });
const NotFoundPage = dynamic(() => import('../NotFoundPage'), { ssr: false });
const UserInfo = dynamic<UserInfoProps>(() => import('../User/UserInfo').then(mod => mod.UserInfo), { ssr: false });


const PageView = React.memo((): JSX.Element => {
  const { t } = useTranslation();

  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: shareLinkId } = useShareLinkId();
  const { data: isUserPage } = useIsUserPage();
  const { data: pageUser } = usePageUser();
  const { data: isNotFound } = useIsNotFound();
  const { data: currentPage } = useSWRxCurrentPage(shareLinkId ?? undefined);
  const { open: openDescendantPageListModal } = useDescendantsPageListModal();

  const isTopPagePath = isTopPage(currentPagePath ?? '');

  return (
    <div className="d-flex flex-column flex-lg-row">

      <div className="flex-grow-1 flex-basis-0 mw-0">
        { isUserPage && pageUser != null && <UserInfo pageUser={pageUser} />}
        { !isNotFound && <Page /> }
        { isNotFound && <NotFoundPage /> }
      </div>

      { !isNotFound && (
        <div className="grw-side-contents-container">
          <div className="grw-side-contents-sticky-container">

            {/* Page list */}
            <div className={`grw-page-accessories-control ${styles['grw-page-accessories-control']}`}>
              { currentPagePath != null && !isSharedUser && (
                <button
                  type="button"
                  className="btn btn-block btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
                  onClick={() => openDescendantPageListModal(currentPagePath)}
                  data-testid="pageListButton"
                >
                  <div className="grw-page-accessories-control-icon">
                    <PageListIcon />
                  </div>
                  {t('page_list')}
                  <CountBadge count={currentPage?.descendantCount} offset={1} />
                </button>
              ) }
            </div>

            {/* Comments */}
            {/* { getCommentListDom != null && !isTopPagePath && ( */}
            { !isTopPagePath && (
              <div className={`mt-2 grw-page-accessories-control ${styles['grw-page-accessories-control']}`}>
                <button
                  type="button"
                  className="btn btn-block btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
                  // onClick={() => smoothScrollIntoView(getCommentListDom, WIKI_HEADER_LINK)}
                >
                  <i className="icon-fw icon-bubbles grw-page-accessories-control-icon"></i>
                  <span>Comments</span>
                  <CountBadge count={currentPage?.commentCount} />
                </button>
              </div>
            ) }

            <div className="d-none d-lg-block">
              <TableOfContents />
              <ContentLinkButtons />
            </div>

          </div>
        </div>
      ) }
    </div>
  );
});
PageView.displayName = 'PageView';


const DisplaySwitcher = React.memo((): JSX.Element => {
  // get element for smoothScroll
  // const getCommentListDom = useMemo(() => { return document.getElementById('page-comments-list') }, []);

  const { data: isEditable } = useIsEditable();

  const { data: editorMode = EditorMode.View } = useEditorMode();

  const isViewMode = editorMode === EditorMode.View;

  const navTabMapping = useMemo(() => {
    return {
      [EditorMode.View]: {
        Content: () => (
          <div data-testid="page-view" id="page-view">
            <PageView />
          </div>
        ),
      },
      [EditorMode.Editor]: {
        Content: () => (
          isEditable
            ? (
              <div data-testid="page-editor" id="page-editor">
                <PageEditor />
              </div>
            )
            : <></>
        ),
      },
      [EditorMode.HackMD]: {
        Content: () => (
          isEditable
            ? (
              <div id="page-editor-with-hackmd">
                {/* <PageEditorByHackmd /> */}
              </div>
            )
            : <></>
        ),
      },
    };
  }, [isEditable]);


  return (
    <>
      <CustomTabContent activeTab={editorMode} navTabMapping={navTabMapping} />

      { isEditable && !isViewMode && <EditorNavbarBottom /> }
      { isEditable && <HashChanged></HashChanged> }
    </>
  );
});
DisplaySwitcher.displayName = 'DisplaySwitcher';

export default DisplaySwitcher;
