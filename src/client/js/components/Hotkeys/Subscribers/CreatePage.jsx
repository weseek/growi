import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import NavigationContainer from '../../../services/NavigationContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';

const CreatePage = (props) => {

  // setup effect
  useEffect(() => {
    props.navigationContainer.openPageCreateModal();

    // remove this
    props.onDeleteRender(this);
  }, [props]);

  return <></>;
};

CreatePage.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  onDeleteRender: PropTypes.func.isRequired,
};

const CreatePageWrapper = withUnstatedContainers(CreatePage, [NavigationContainer]);

CreatePageWrapper.getHotkeyStrokes = () => {
  return [['c']];
};

export default CreatePageWrapper;
