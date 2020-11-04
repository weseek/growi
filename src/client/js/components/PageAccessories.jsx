import React from 'react';
import PropTypes from 'prop-types';

import PageAccessoriesModalControl from './PageAccessoriesModalControl';
import PageAccessoriesModal from './PageAccessoriesModal';

import { withUnstatedContainers } from './UnstatedUtils';
import PageAccessoriesContainer from '../services/PageAccessoriesContainer';

const PageAccessories = (props) => {
  const { pageAccessoriesContainer, isGuestUserMode } = props;

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
const PageAccessoriesWrapper = withUnstatedContainers(PageAccessories, [PageAccessoriesContainer]);

PageAccessories.propTypes = {
  pageAccessoriesContainer: PropTypes.instanceOf(PageAccessoriesContainer).isRequired,

  isGuestUserMode: PropTypes.bool.isRequired,
};

export default PageAccessoriesWrapper;
