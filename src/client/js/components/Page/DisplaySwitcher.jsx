import React from 'react';
import propTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
// import PageContainer from '../../services/PageContainer';
import NavigationContainer from '../../services/NavigationContainer';
import Editor from '../PageEditor';
import Page from '../Page';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';


const DisplaySwitcher = (props) => {
  const { navigationContainer /* , pageContainer  */ } = props;
  // const { page } = pageContainer;

  return (
    <div>
      {navigationContainer.state.editorMode === 'view' && <Page /* page={page} */ />}
      {navigationContainer.state.editorMode === 'edit' && (
        <>
          <Editor />
          <EditorNavbarBottom />
        </>
        )}
      {navigationContainer.state.editorMode === 'hackmd' && <PageEditorByHackmd />}
    </div>
  );

};

DisplaySwitcher.propTypes = {
  navigationContainer: propTypes.instanceOf(NavigationContainer).isRequired,
  // pageContainer: propTypes.instanceOf(PageContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [/* PageContainer, */NavigationContainer]);
