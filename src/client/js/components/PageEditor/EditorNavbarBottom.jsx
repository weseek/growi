import React from 'react';
import PropTypes from 'prop-types';

import NavigationContainer from '../../services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import SavePageControls from '../SavePageControls';

import OptionsSelector from './OptionsSelector';

const EditorNavbarBottom = (props) => {

  const {
    navigationContainer,
  } = props;
  const { editorMode, isDeviceSmallerThanMd } = navigationContainer.state;

  const showOptionsSelector = editorMode !== 'hackmd';

  const additionalClasses = ['grw-editor-navbar-bottom'];

  return (
    <div className={`navbar navbar-expand border-top ${additionalClasses.join(' ')}`}>
      <form className="form-inline mr-auto">
        { showOptionsSelector && <OptionsSelector /> }
      </form>
      <form className="form-inline">
        <SavePageControls />
      </form>
    </div>
  );
};

EditorNavbarBottom.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withUnstatedContainers(EditorNavbarBottom, [NavigationContainer]);
