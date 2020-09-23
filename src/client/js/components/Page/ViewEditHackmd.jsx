import React from 'react';
import propTypes from 'prop-types';
import PageEditor from '../PageEditor';
import Page from '../Page';
import PageEditorByHackmd from '../PageEditorByHackmd';
import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';


const ViewEditHackmd = (props) => {
  const { navigationContainer } = props;

  return (
    <div>
      {navigationContainer.state.editorMode === 'view' && 'view'}
      {navigationContainer.state.editorMode === 'edit' && 'edit'}
      {navigationContainer.state.editorMode === 'hackmd' && 'hackmd'}
    </div>
  );

};

ViewEditHackmd.propTypes = {
  navigationContainer: propTypes.instanceOf(NavigationContainer).isRequired,
};


export default withUnstatedContainers(ViewEditHackmd, [NavigationContainer]);
