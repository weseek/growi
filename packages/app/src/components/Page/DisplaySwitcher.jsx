import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import propTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '~/client/services/NavigationContainer';
import PageContainer from '~/client/services/PageContainer';
import Editor from '../PageEditor';
import Page from '../Page';
import UserInfo from '../User/UserInfo';
import TableOfContents from '../TableOfContents';
import ContentLinkButtons from '../ContentLinkButtons';
import PageAccessories from '../PageAccessories';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';


const DisplaySwitcher = (props) => {
  const {
    navigationContainer, pageContainer,
  } = props;
  const { editorMode } = navigationContainer.state;
  const { isPageExist, pageUser } = pageContainer.state;

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId="view">
          <div className="d-flex flex-column flex-lg-row-reverse">

            <div className="grw-side-contents-container">
              <div className="grw-side-contents-sticky-container">
                <div className="border-bottom pb-1">
                  <PageAccessories isNotFoundPage={!isPageExist} />
                </div>

                <div className="d-none d-lg-block">
                  <div id="revision-toc" className="revision-toc">
                    <TableOfContents />
                  </div>
                  <ContentLinkButtons />
                </div>
              </div>
            </div>

            <div className="flex-grow-1 flex-basis-0 mw-0">
              {pageUser && <UserInfo pageUser={pageUser} />}
              <Page />
            </div>

          </div>
        </TabPane>
        <TabPane tabId="edit">
          <div id="page-editor">
            <Editor />
          </div>
        </TabPane>
        <TabPane tabId="hackmd">
          <div id="page-editor-with-hackmd">
            <PageEditorByHackmd />
          </div>
        </TabPane>
      </TabContent>
      {editorMode !== 'view' && <EditorNavbarBottom /> }
    </>
  );
};

DisplaySwitcher.propTypes = {
  navigationContainer: propTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: propTypes.instanceOf(PageContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [NavigationContainer, PageContainer]);
