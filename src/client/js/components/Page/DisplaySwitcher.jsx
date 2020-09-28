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

  $('#view').on('click', () => {
    $('body').removeClass('on-edit');
    $('body').removeClass('builtin-editor');
    $('body').removeClass('hackmd');
  });

  $('#edit').on('click', () => {
    $('body').addClass('on-edit');
    $('body').addClass('builtin-editor');
    $('body').removeClass('hackmd');
  });

  $('#hackmd').on('click', () => {
    $('body').addClass('on-edit');
    $('body').addClass('hackmd');
    $('body').removeClass('builtin-editor');


  });

  return (
    <>
      <TabContent activeTab={editorMode}>
        <TabPane tabId="view">
          <Page />
        </TabPane>
        <TabPane tabId="edit">
          <div id="page-editor" className="page-editor-preview-container page-editor-preview-body">
            <Editor />
            <EditorNavbarBottom />
          </div>
        </TabPane>
        <TabPane tabId="hackmd">
          <div id="page-editor-with-hackmd" className="hackmd-preinit hackmd-error">
            <PageEditorByHackmd />
            <EditorNavbarBottom />
          </div>
        </TabPane>
      </TabContent>
    </>
  );
};

DisplaySwitcher.propTypes = {
  navigationContainer: propTypes.instanceOf(NavigationContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [NavigationContainer]);
