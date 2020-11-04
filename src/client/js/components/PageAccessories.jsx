import React from 'react';
import PropTypes from 'prop-types';

import PageAccessoriesModalControl from './PageAccessoriesModalControl';
import PageAccessoriesModal from './PageAccessoriesModal';

import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';
import PageAccessoriesContainer from '../services/PageAccessoriesContainer';

const PageAccessories = (props) => {
  const { appContainer, pageAccessoriesContainer } = props;
  const isGuestUserMode = appContainer.currentUser == null;

  // not render only when this page is shared and user is not login.
  if (appContainer.isSharedUser && isGuestUserMode) {
    return null;
  }

  return (
    <>
      <PageAccessoriesModalControl isGuestUserMode={isGuestUserMode} />
      <PageAccessoriesModal
        isGuestUserMode={isGuestUserMode}
        isOpen={pageAccessoriesContainer.state.isPageAccessoriesModalShown}
        onClose={pageAccessoriesContainer.closePageAccessoriesModal}
      />
    </>
  );
};
/**
 * Wrapper component for using unstated
 */
const PageAccessoriesWrapper = withUnstatedContainers(PageAccessories, [AppContainer, PageAccessoriesContainer]);

PageAccessories.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageAccessoriesContainer: PropTypes.instanceOf(PageAccessoriesContainer).isRequired,
};

export default PageAccessoriesWrapper;
