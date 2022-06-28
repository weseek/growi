import React, { useMemo } from 'react';

import { pagePathUtils } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { TabContent, TabPane } from 'reactstrap';


import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import {
  useIsSharedUser, useIsEditable, useCurrentPageId, useIsUserPage, usePageUser, useShareLinkId, useIsEmptyPage,
} from '~/stores/context';
import { useDescendantsPageListModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';

import CountBadge from '../Common/CountBadge';
import ContentLinkButtons from '../ContentLinkButtons';
import HashChanged from '../EventListeneres/HashChanged';
import PageListIcon from '../Icons/PageListIcon';
import Page from '../Page';
import PageEditor from '../PageEditor';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';
import PageEditorByHackmd from '../PageEditorByHackmd';
import TableOfContents from '../TableOfContents';
import UserInfo from '../User/UserInfo';


const WIKI_HEADER_LINK = 120;

const { isTopPage } = pagePathUtils;


const DisplaySwitcher = (): JSX.Element => {
  const { t } = useTranslation();

  // get element for smoothScroll
  const getCommentListDom = useMemo(() => { return document.getElementById('page-comments-list') }, []);

  const { data: isEmptyPage } = useIsEmptyPage();
  const { data: currentPageId } = useCurrentPageId();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: shareLinkId } = useShareLinkId();
  const { data: isUserPage } = useIsUserPage();
  const { data: isEditable } = useIsEditable();
  const { data: pageUser } = usePageUser();
  const { data: currentPage } = useSWRxCurrentPage(shareLinkId ?? undefined);

  const { data: editorMode } = useEditorMode();

  const { open: openDescendantPageListModal } = useDescendantsPageListModal();

  const isPageExist = currentPageId != null;
  const isViewMode = editorMode === EditorMode.View;
  const isTopPagePath = isTopPage(currentPage?.path ?? '');

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId={EditorMode.View}>
          <div className="d-flex flex-column flex-lg-row-reverse">

            { isPageExist && !isEmptyPage && (
              <div className="grw-side-contents-container">
                <div className="grw-side-contents-sticky-container">

                  {/* Page list */}
                  <div className="grw-page-accessories-control">
                    { currentPage?.path != null && !isSharedUser && (
                      <button
                        type="button"
                        className="btn btn-block btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
                        onClick={() => openDescendantPageListModal(currentPage?.path)}
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
                  { getCommentListDom != null && !isTopPagePath && (
                    <div className="grw-page-accessories-control mt-2">
                      <button
                        type="button"
                        className="btn btn-block btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
                        onClick={() => smoothScrollIntoView(getCommentListDom, WIKI_HEADER_LINK)}
                      >
                        <i className="icon-fw icon-bubbles grw-page-accessories-control-icon"></i>
                        <span>Comments</span>
                        <CountBadge count={currentPage?.commentCount} />
                      </button>
                    </div>
                  ) }

                  <div className="d-none d-lg-block">
                    <div id="revision-toc" className="revision-toc">
                      <TableOfContents />
                    </div>
                    <ContentLinkButtons />
                  </div>

                </div>
              </div>
            ) }

            <div className="flex-grow-1 flex-basis-0 mw-0">
              { isUserPage && <UserInfo pageUser={pageUser} />}
              <Page />
            </div>

          </div>
        </TabPane>
        { isEditable && (
          <TabPane tabId={EditorMode.Editor}>
            <div data-testid="page-editor" id="page-editor">
              <PageEditor />
            </div>
          </TabPane>
        ) }
        { isEditable && (
          <TabPane tabId={EditorMode.HackMD}>
            <div id="page-editor-with-hackmd">
              <PageEditorByHackmd />
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
