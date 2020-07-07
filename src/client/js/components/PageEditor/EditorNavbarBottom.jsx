import React, { useState /* useMemo */ } from 'react';
import PropTypes from 'prop-types';

import NavigationContainer from '../../services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import SavePageControls from '../SavePageControls';

import OptionsSelector from './OptionsSelector';

const EditorNavbarBottom = (props) => {

  const [isExpanded, setExpanded] = useState(false);

  const {
    navigationContainer,
  } = props;
  const { editorMode, isDrawerMode /* isDeviceSmallerThanMd */ } = navigationContainer.state;

  const showOptionsSelector = editorMode !== 'hackmd';

  const additionalClasses = ['grw-editor-navbar-bottom'];

  const renderDrawerButton = () => (
    isDrawerMode && (
      <button type="button" className="btn btn-outline-secondary border-0" onClick={() => navigationContainer.toggleDrawer()}>
        <i className="icon-menu"></i>
      </button>
    )
  );

  // eslint-disable-next-line react/prop-types
  const renderExpandButton = () => (
    <div className="d-md-none ml-2">
      <button
        type="button"
        className={`btn btn-outline-secondary btn-expand border-0 ${isExpanded ? 'expand' : ''}`}
        onClick={() => setExpanded(!isExpanded)}
      >
        <i className="icon-arrow-up"></i>
      </button>
    </div>
  );

  return (
    <div className={`navbar navbar-expand border-top fixed-bottom px-2 ${additionalClasses.join(' ')}`}>
      <form className="form-inline mr-auto">
        { renderDrawerButton() }
        { showOptionsSelector && <OptionsSelector /> }
      </form>
      <form className="form-inline">
        <SavePageControls />
        { renderExpandButton() }
      </form>
    </div>
  );
};

EditorNavbarBottom.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withUnstatedContainers(EditorNavbarBottom, [NavigationContainer]);
