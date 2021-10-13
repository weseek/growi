import React from 'react';
import PropTypes from 'prop-types';
import AppContainer from '~/client/services/AppContainer';
import NavigationContainer from '~/client/services/NavigationContainer';
import PageContainer from '~/client/services/PageContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import BookmarkButton from '../BookmarkButton';
import LikeButton from '../LikeButton';
import SubscribeButton from '../SubscribeButton';
import PageManagement from '../Page/PageManagement';

/* eslint-disable react/prop-types */
const PageReactionButtons = ({ pageContainer }) => {
  return (
    <>
      <span>
        <SubscribeButton pageId={pageContainer.state.pageId} />
      </span>
      {pageContainer.isAbleToShowLikeButton && (
        <span>
          <LikeButton />
        </span>
      )}
      <span>
        <BookmarkButton />
      </span>

    </>
  );
};
/* eslint-disable react/prop-types */


const SubnavButtons = (props) => {
  const {
    navigationContainer, pageContainer, isCompactMode,
  } = props;

  const { editorMode } = navigationContainer.state;
  const isViewMode = editorMode === 'view';

  return (
    <>
      {isViewMode && (
        <>
          { pageContainer.isAbleToShowPageReactionButtons && <PageReactionButtons pageContainer={pageContainer} /> }
          { pageContainer.isAbleToShowPageManagement && <PageManagement isCompactMode={isCompactMode} /> }
        </>
      )}
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
const SubnavButtonsWrapper = withUnstatedContainers(SubnavButtons, [AppContainer, NavigationContainer, PageContainer]);


SubnavButtons.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isCompactMode: PropTypes.bool,
};

export default SubnavButtonsWrapper;
