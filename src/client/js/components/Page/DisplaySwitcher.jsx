import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import propTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import Editor from '../PageEditor';
import Page from '../Page';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';
// import TableOfContents from '../TableOfContents';


const DisplaySwitcher = (props) => {
  const { navigationContainer } = props;
  const { editorMode } = navigationContainer.state;

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId="view">
          <Page />
        </TabPane>
        <TabPane tabId="edit">
          <Editor />
        </TabPane>
        <TabPane tabId="hackmd">
          <PageEditorByHackmd />
        </TabPane>
      </TabContent>
      <EditorNavbarBottom />
    </>
  );
};

DisplaySwitcher.propTypes = {
  navigationContainer: propTypes.instanceOf(NavigationContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [NavigationContainer]);
