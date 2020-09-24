import React from 'react';
import propTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';
import Editor from '../PageEditor';
import Page from '../Page';
import PageEditorByHackmd from '../PageEditorByHackmd';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';


const DisplaySwitcher = (props) => {
  const { navigationContainer } = props;

  return (
    <div className="">
      {navigationContainer.state.editorMode === 'view' && <Page />}
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
};


export default withUnstatedContainers(DisplaySwitcher, [NavigationContainer]);
