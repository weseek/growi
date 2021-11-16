import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import AppContainer from '~/client/services/AppContainer';
import NavigationContainer from '~/client/services/NavigationContainer';
import PageContainer from '~/client/services/PageContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import PageReactionButtons from '../PageReactionButtons';
import PageManagement from '../Page/PageManagement';


const SubnavButtons = (props) => {
  const {
    appContainer, navigationContainer, pageContainer, isCompactMode,
  } = props;

  const { pageId } = pageContainer.state;
  const { editorMode } = navigationContainer.state;
  const isViewMode = editorMode === 'view';
  const { sumOfLikers, likerIds, isLiked } = pageContainer.state;
  return (
    <>
      {isViewMode && (
        <>
          {pageContainer.isAbleToShowPageReactionButtons && (
            <PageReactionButtons
              pageId={pageId}
              currentUserId={appContainer.state.currentUserId}
              likerSum={sumOfLikers}
              likerIds={likerIds}
              isAlreadyLiked={isLiked}
            />
          )}
          {pageContainer.isAbleToShowPageManagement && <PageManagement isCompactMode={isCompactMode} />}
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
