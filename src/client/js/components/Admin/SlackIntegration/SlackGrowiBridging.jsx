import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';

const SlackGrowiBridging = (props) => {
  return 'hoge';
};
const SlackGrowiBridgingWrapper = withUnstatedContainers(SlackGrowiBridging, [AppContainer, AdminAppContainer]);

SlackGrowiBridgingWrapper.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};
export default SlackGrowiBridgingWrapper;
