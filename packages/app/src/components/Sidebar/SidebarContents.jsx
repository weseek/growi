import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import NavigationContainer from '~/client/services/NavigationContainer';

import RecentChanges from './RecentChanges';
import CustomSidebar from './CustomSidebar';
import Tag from './Tag';

const SidebarContents = (props) => {
  const { appContainer, navigationContainer, isSharedUser } = props;

  if (isSharedUser) {
    return null;
  }

  if (navigationContainer.state.sidebarContentsId === 'recent') {
    return <RecentChanges />;
  }
  if (navigationContainer.state.sidebarContentsId === 'tag') {
    return <Tag appContainer={appContainer} navigationContainer={navigationContainer} />;
  }

  return <CustomSidebar />;

};

SidebarContents.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isSharedUser: PropTypes.bool,
};

SidebarContents.defaultProps = {
  isSharedUser: false,
};

/**
 * Wrapper component for using unstated
 */
const SidebarContentsWrapper = withUnstatedContainers(SidebarContents, [NavigationContainer]);

export default withTranslation()(SidebarContentsWrapper);
