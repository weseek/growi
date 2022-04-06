import React from 'react';
import PropTypes from 'prop-types';

import PageAccessoriesModalControl from './PageAccessoriesModalControl';
import PageAccessoriesModal from './PageAccessoriesModal';

import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import PageAccessoriesContainer from '~/client/services/PageAccessoriesContainer';

const PageAccessories = (props) => {
  const { appContainer, pageAccessoriesContainer, isNotFoundPage } = props;
  const { isGuestUser, isSharedUser } = appContainer;

  return (
    <>
      <PageAccessoriesModalControl
        isGuestUser={isGuestUser}
        isSharedUser={isSharedUser}
        isNotFoundPage={isNotFoundPage}
      />
      <PageAccessoriesModal
        isGuestUser={isGuestUser}
        isSharedUser={isSharedUser}
        isNotFoundPage={isNotFoundPage}
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

  isNotFoundPage: PropTypes.bool.isRequired,
};

export default PageAccessoriesWrapper;
