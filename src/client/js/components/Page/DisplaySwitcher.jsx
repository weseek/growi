import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import propTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import PageAccessoriesContainer from '../../services/PageAccessoriesContainer';
import Editor from '../PageEditor';
import Page from '../Page';
import UserInfo from '../User/UserInfo';
import TableOfContents from '../TableOfContents';
import UserContentsLinks from '../UserContentsLinks';
import PageAccessoriesModalControl from '../PageAccessoriesModalControl';
import PageAccessoriesModal from '../PageAccessoriesModal';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';


const DisplaySwitcher = (props) => {
  const {
    navigationContainer, appContainer, pageContainer, pageAccessoriesContainer,
  } = props;
  const { editorMode } = navigationContainer.state;
  const { pageUser } = pageContainer.state;
  const { isGuestUser, isSharedUser } = appContainer;
  const { closePageAccessoriesModal } = pageAccessoriesContainer;
  const { isPageAccessoriesModalShown } = pageAccessoriesContainer.state;

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId="view">

          <div className="d-flex d-md-none justify-content-end border-bottom">
            <PageAccessoriesModalControl
              isGuestUser={isGuestUser}
              isSharedUser={isSharedUser}
            />
          </div>

          <div className="d-flex flex-row justify-content-around">
            <div className="w-100">
              {pageUser && <UserInfo pageUser={pageUser} />}
              <Page />
            </div>

            <div className="d-none d-md-block grw-side-contents-container">
              <div className="grw-side-contents-sticky-container">
                <PageAccessoriesModalControl
                  isGuestUser={isGuestUser}
                  isSharedUser={isSharedUser}
                />
                <div id="revision-toc" className="revision-toc">
                  <TableOfContents />
                </div>
                {pageUser && <UserContentsLinks />}
              </div>
            </div>
          </div>

          <PageAccessoriesModal
            isGuestUser={isGuestUser}
            isSharedUser={isSharedUser}
            isOpen={isPageAccessoriesModalShown}
            onClose={closePageAccessoriesModal}
          />

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
  appContainer: propTypes.instanceOf(AppContainer).isRequired,
  pageContainer: propTypes.instanceOf(PageContainer).isRequired,
  pageAccessoriesContainer: propTypes.instanceOf(PageAccessoriesContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [NavigationContainer, AppContainer, PageContainer, PageAccessoriesContainer]);
