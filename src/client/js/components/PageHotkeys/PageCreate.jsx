import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import NavigationContainer from '../../services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

const PageCreate = (props) => {

  // setup effect
  useEffect(() => {
    props.navigationContainer.openPageCreateModal();

    // remove this
    props.onDeleteRender(this);
  }, [props]);

  return <></>;
};

PageCreate.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  onDeleteRender: PropTypes.func.isRequired,
};

const PageCreateWrapper = withUnstatedContainers(PageCreate, [NavigationContainer]);

PageCreateWrapper.getHotkeyStrokes = () => {
  return [['c']];
};

export default PageCreateWrapper;
