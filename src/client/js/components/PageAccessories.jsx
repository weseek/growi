import React from 'react';
import PropTypes from 'prop-types';

import PageAccessoriesModalControl from './PageAccessoriesModalControl';
import PageAccessoriesModal from './PageAccessoriesModal';

import { withUnstatedContainers } from './UnstatedUtils';
import PageContainer from '../services/PageContainer';
import PageAccessoriesContainer from '../services/PageAccessoriesContainer';

const PageAccessories = (props) => {
  const { pageContainer, pageAccessoriesContainer } = props;
  const { isGuestUser, isSharedUser } = pageContainer.state;

  return (
    <>
      <PageAccessoriesModalControl isGuestUser={isGuestUser} isSharedUser={isSharedUser} />
      <PageAccessoriesModal
        isGuestUser={isGuestUser}
        isSharedUser={isSharedUser}
        isOpen={pageAccessoriesContainer.state.isPageAccessoriesModalShown}
        onClose={pageAccessoriesContainer.closePageAccessoriesModal}
      />
    </>
  );
};
/**
 * Wrapper component for using unstated
 */
const PageAccessoriesWrapper = withUnstatedContainers(PageAccessories, [PageContainer, PageAccessoriesContainer]);

PageAccessories.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  pageAccessoriesContainer: PropTypes.instanceOf(PageAccessoriesContainer).isRequired,
};

export default PageAccessoriesWrapper;
