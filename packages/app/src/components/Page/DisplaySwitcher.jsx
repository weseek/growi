import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import propTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import PageContainer from '~/client/services/PageContainer';
import { EditorMode, useEditorMode } from '~/stores/ui';

import Editor from '../PageEditor';
import Page from '../Page';
import UserInfo from '../User/UserInfo';
import TableOfContents from '../TableOfContents';
import ContentLinkButtons from '../ContentLinkButtons';
import PageAccessories from '../PageAccessories';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';
import HashChanged from '../EventListeneres/HashChanged';
import { useIsEditable } from '~/stores/context';


const DisplaySwitcher = (props) => {
  const {
    pageContainer,
  } = props;
  const { isPageExist, pageUser } = pageContainer.state;

  const { data: isEditable } = useIsEditable();
  const { data: editorMode } = useEditorMode();

  const isViewMode = editorMode === EditorMode.View;

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId={EditorMode.View}>
          <div className="d-flex flex-column flex-lg-row-reverse">

            { isPageExist && (
              <div className="grw-side-contents-container">
                <div className="grw-side-contents-sticky-container">
                  <div className="border-bottom pb-1">
                    <PageAccessories />
                  </div>

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
              {pageUser && <UserInfo pageUser={pageUser} />}
              <Page />
            </div>

          </div>
        </TabPane>
        { isEditable && (
          <TabPane tabId={EditorMode.Editor}>
            <div id="page-editor">
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

DisplaySwitcher.propTypes = {
  pageContainer: propTypes.instanceOf(PageContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [PageContainer]);
