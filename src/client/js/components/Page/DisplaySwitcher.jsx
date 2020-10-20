import dynamic from 'next/dynamic';
import React from 'react';
import { TabContent, TabPane } from 'reactstrap';
import propTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import Page from '../Page';


const DisplaySwitcher = (props) => {
  const { navigationContainer } = props;
  const { editorMode } = navigationContainer.state;

  // dynamic import to skip rendering at SSR
  const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
  const PageEditorByHackmd = dynamic(() => import('../PageEditorByHackmd'), { ssr: false });
  const EditorNavbarBottom = dynamic(() => import('../PageEditor/EditorNavbarBottom'), { ssr: false });

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId="view">
          <Page />
        </TabPane>
        <TabPane tabId="edit">
          <div id="page-editor">
            <PageEditor />
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
};


export default withUnstatedContainers(DisplaySwitcher, [NavigationContainer]);
