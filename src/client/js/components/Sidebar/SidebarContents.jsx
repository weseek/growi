import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';

import RecentChanges from './RecentChanges';
import CustomSidebar from './CustomSidebar';

const SidebarContents = (props) => {

  const { navigationContainer } = props;

  let Contents;
  switch (navigationContainer.state.sidebarContentsId) {
    case 'recent':
      Contents = RecentChanges;
      break;
    default:
      Contents = CustomSidebar;
  }

  return (
    <Contents />
  );

};

SidebarContents.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const SidebarContentsWrapper = withUnstatedContainers(SidebarContents, [NavigationContainer]);

export default withTranslation()(SidebarContentsWrapper);
