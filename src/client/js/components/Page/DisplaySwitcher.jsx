import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import propTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import Editor from '../PageEditor';
import Page from '../Page';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';


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
          <>
            <Editor />
            <EditorNavbarBottom />
          </>
        </TabPane>
        <TabPane tabId="hackmd">
          <PageEditorByHackmd />
        </TabPane>
      </TabContent>
    </>
  );
};

DisplaySwitcher.propTypes = {
  navigationContainer: propTypes.instanceOf(NavigationContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [NavigationContainer]);
