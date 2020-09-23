import React from 'react';
import propTypes from 'prop-types';
import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';


const DisplaySwitcher = (props) => {
  const { navigationContainer } = props;

  return (
    <>
      {navigationContainer.state.editorMode === 'view' && 'view'}
      {navigationContainer.state.editorMode === 'edit' && 'edit'}
      {navigationContainer.state.editorMode === 'hackmd' && 'hackmd'}
    </>
  );

};

DisplaySwitcher.propTypes = {
  navigationContainer: propTypes.instanceOf(NavigationContainer).isRequired,
};


export default withUnstatedContainers(DisplaySwitcher, [NavigationContainer]);
