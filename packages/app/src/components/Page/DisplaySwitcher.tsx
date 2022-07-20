import React from 'react';

import { pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { TabContent, TabPane } from 'reactstrap';

import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import {
  useCurrentPagePath, useIsSharedUser, useIsEditable, useIsUserPage, usePageUser, useShareLinkId, useIsNotFound, useIsNotCreatable,
} from '~/stores/context';
import { useDescendantsPageListModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';

import CountBadge from '../Common/CountBadge';
import PageListIcon from '../Icons/PageListIcon';
import { NotCreatablePage } from '../NotCreatablePage';
import NotFoundPage from '../NotFoundPage';
import { Page } from '../Page';
// import PageEditor from '../PageEditor';
// import PageEditorByHackmd from '../PageEditorByHackmd';
import TableOfContents from '../TableOfContents';
import UserInfo from '../User/UserInfo';

import styles from '../TableOfContents.module.scss';


const WIKI_HEADER_LINK = 120;

const { isTopPage } = pagePathUtils;


const DisplaySwitcher = (): JSX.Element => {
  const { t } = useTranslation();

  const EditorNavbarBottom = dynamic(() => import('../PageEditor/EditorNavbarBottom'), { ssr: false });
  const HashChanged = dynamic(() => import('../EventListeneres/HashChanged'), { ssr: false });
  const ContentLinkButtons = dynamic(() => import('../ContentLinkButtons'), { ssr: false });

  // get element for smoothScroll
  // const getCommentListDom = useMemo(() => { return document.getElementById('page-comments-list') }, []);

  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: shareLinkId } = useShareLinkId();
  const { data: isUserPage } = useIsUserPage();
  const { data: isEditable } = useIsEditable();
  const { data: pageUser } = usePageUser();
  const { data: isNotFound } = useIsNotFound();
  const { data: isNotCreatable } = useIsNotCreatable();
  const { data: currentPage } = useSWRxCurrentPage(shareLinkId ?? undefined);

  const { data: editorMode } = useEditorMode();

  const { open: openDescendantPageListModal } = useDescendantsPageListModal();

  const isViewMode = editorMode === EditorMode.View;
  const isTopPagePath = isTopPage(currentPagePath ?? '');

  const revision = currentPage?.revision;

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId={EditorMode.View}>
          <div className="d-flex flex-column flex-lg-row">

            <div className="flex-grow-1 flex-basis-0 mw-0">
              { isUserPage && <UserInfo pageUser={pageUser} />}
              { !isNotFound && <Page /> }
              { isNotFound && !isNotCreatable && <NotFoundPage /> }
              { isNotFound && isNotCreatable && <NotCreatablePage /> }
            </div>

            { !isNotFound && !currentPage?.isEmpty && (
              <div className="grw-side-contents-container">
                <div className="grw-side-contents-sticky-container">

                  {/* Page list */}
                  <div className="grw-page-accessories-control">
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
                    <div className="grw-page-accessories-control mt-2">
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
                    <div id="revision-toc" className={`revision-toc ${styles['revision-toc']}`}>
                      <TableOfContents />
                    </div>
                    <ContentLinkButtons />
                  </div>

                </div>
              </div>
            ) }

          </div>
        </TabPane>
        { isEditable && (
          <TabPane tabId={EditorMode.Editor}>
            <div data-testid="page-editor" id="page-editor">
              {/* <PageEditor /> */}
            </div>
          </TabPane>
        ) }
        { isEditable && (
          <TabPane tabId={EditorMode.HackMD}>
            <div id="page-editor-with-hackmd">
              {/* <PageEditorByHackmd /> */}
            </div>
          </TabPane>
        ) }
      </TabContent>
      { isEditable && !isViewMode && <EditorNavbarBottom /> }

      { isEditable && <HashChanged></HashChanged> }
    </>
  );
};

export default DisplaySwitcher;
