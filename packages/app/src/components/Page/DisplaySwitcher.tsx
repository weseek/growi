import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TabContent, TabPane } from 'reactstrap';

import { pagePathUtils } from '@growi/core';

import { EditorMode, useEditorMode } from '~/stores/ui';
import { useDescendantsPageListModal } from '~/stores/modal';
import {
  useCurrentPagePath, useIsSharedUser, useIsEditable, useCurrentPageId, useIsUserPage, usePageUser,
} from '~/stores/context';


import { smoothScrollIntoView } from '~/client/util/smooth-scroll';

import PageListIcon from '../Icons/PageListIcon';
import Editor from '../PageEditor';
import Page from '../Page';
import UserInfo from '../User/UserInfo';
import TableOfContents from '../TableOfContents';
import ContentLinkButtons from '../ContentLinkButtons';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';
import HashChanged from '../EventListeneres/HashChanged';


const WIKI_HEADER_LINK = 120;

const { isTopPage } = pagePathUtils;


const DisplaySwitcher = (): JSX.Element => {
  const { t } = useTranslation();


  // get element for smoothScroll
  const getCommentListDom = useMemo(() => { return document.getElementById('page-comments-list') }, []);


  const { data: currentPageId } = useCurrentPageId();
  const { data: currentPath } = useCurrentPagePath();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: isUserPage } = useIsUserPage();
  const { data: isEditable } = useIsEditable();
  const { data: pageUser } = usePageUser();

  const { data: editorMode } = useEditorMode();

  const { open: openDescendantPageListModal } = useDescendantsPageListModal();

  const isPageExist = currentPageId != null;
  const isViewMode = editorMode === EditorMode.View;
  const isTopPagePath = isTopPage(currentPath ?? '');

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId={EditorMode.View}>
          <div className="d-flex flex-column flex-lg-row-reverse">

            { isPageExist && (
              <div className="grw-side-contents-container">
                <div className="grw-side-contents-sticky-container">

                  {/* Page list */}
                  <div className="grw-page-accessories-control">
                    { currentPath != null && !isSharedUser && (
                      <button
                        type="button"
                        className="btn btn-block btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
                        onClick={() => openDescendantPageListModal(currentPath)}
                      >
                        <PageListIcon />
                        {t('page_list')}
                        <span></span> {/* for a count badge */}
                      </button>
                    ) }
                  </div>

                  {/* Comments */}
                  { getCommentListDom != null && !isTopPagePath && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-block btn-outline-secondary grw-btn-page-accessories rounded-pill d-flex justify-content-between align-items-center"
                        onClick={() => smoothScrollIntoView(getCommentListDom, WIKI_HEADER_LINK)}
                      >
                        <i className="mr-2 icon-fw icon-bubbles"></i>
                        <span>Comments</span>
                        <span></span> {/* for a count badge */}
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
              <Editor />
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
