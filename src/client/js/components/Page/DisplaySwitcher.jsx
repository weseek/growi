import React from 'react';
import propTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
import PageContainer from '../../services/PageContainer';
import NavigationContainer from '../../services/NavigationContainer';
import Editor from '../PageEditor';
import Page from '../Page';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';


const DisplaySwitcher = (props) => {
  const { navigationContainer, pageContainer } = props;
  const { page } = pageContainer;
  const { editorMode } = navigationContainer.state;

  return (
    <>
      {editorMode === 'view' && <Page />}
      {editorMode === 'edit' && (
        <>
          <Editor />
          <EditorNavbarBottom />
        </>
      )}
      {editorMode === 'hackmd' && <PageEditorByHackmd />}
    </>
  );
};

DisplaySwitcher.propTypes = {
  navigationContainer: propTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: propTypes.instanceOf(PageContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [PageContainer, NavigationContainer]);
