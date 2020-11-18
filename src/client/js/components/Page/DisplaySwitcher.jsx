import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import propTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import AppContainer from '../../services/AppContainer';
import PageAccessoriesContainer from '../../services/PageAccessoriesContainer';
import Editor from '../PageEditor';
import Page from '../Page';
import TableOfContents from '../TableOfContents';
import PageAccessoriesModalControl from '../PageAccessoriesModalControl';
import PageAccessoriesModal from '../PageAccessoriesModal';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';


const DisplaySwitcher = (props) => {
  const { navigationContainer, appContainer, pageAccessoriesContainer } = props;
  const { editorMode, isDeviceSmallerThanMd } = navigationContainer.state;
  const { isGuestUser, isSharedUser } = appContainer;
  const { closePageAccessoriesModal } = pageAccessoriesContainer;
  const { isPageAccessoriesModalShown } = pageAccessoriesContainer.state;

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId="view">
          {(isDeviceSmallerThanMd) ? (
            <div className="d-flex d-lg-none justify-content-end border-bottom">
              <PageAccessoriesModalControl
                isGuestUser={isGuestUser}
                isSharedUser={isSharedUser}
              />
            </div>
           ) : (
             <div className="d-edit-none grw-side-contents-container">
               <div className="grw-side-contents-sticky-container">
                 <div className="page-accessories">
                   <PageAccessoriesModalControl
                     isGuestUser={isGuestUser}
                     isSharedUser={isSharedUser}
                   />
                 </div>
                 <div className="revision-toc sps sps--sbv" data-sps-offset="123">
                   <TableOfContents />
                 </div>
               </div>
             </div>


         )}
          <PageAccessoriesModal
            isGuestUser={isGuestUser}
            isSharedUser={isSharedUser}
            isOpen={isPageAccessoriesModalShown}
            onClose={closePageAccessoriesModal}
          />
          <Page />
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
  pageAccessoriesContainer: propTypes.instanceOf(PageAccessoriesContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [NavigationContainer, AppContainer, PageAccessoriesContainer]);
