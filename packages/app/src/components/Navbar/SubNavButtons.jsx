import React from 'react';
import PropTypes from 'prop-types';
import AppContainer from '~/client/services/AppContainer';
import NavigationContainer from '~/client/services/NavigationContainer';
import PageContainer from '~/client/services/PageContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import BookmarkButton from '../BookmarkButton';
import LikeButtons from '../LikeButtons';
import PageManagement from '../Page/PageManagement';
import { toastError } from '~/client/util/apiNotification';

const SubnavButtons = (props) => {
  const {
    appContainer, navigationContainer, pageContainer, isCompactMode,
  } = props;

  /* eslint-enable react/prop-types */

  /* eslint-disable react/prop-types */
  const PageReactionButtons = ({ pageContainer }) => {

    const {
      state: { likers, sumOfLikers, isLiked },
    } = pageContainer;

    const toggleLike = () => {
      const { isGuestUser } = appContainer;

      if (isGuestUser) {
        return;
      }

      try {
        pageContainer.toggleLike();
      }
      catch (err) {
        toastError(err);
      }
    };

    return (
      <>
        {pageContainer.isAbleToShowLikeButtons && (
          <span>
            <LikeButtons onClickInvoked={toggleLike} likers={likers} sumOfLikers={sumOfLikers} isLiked={isLiked} />
          </span>
        )}
        <span>
          <BookmarkButton />
        </span>
      </>
    );
  };
  /* eslint-enable react/prop-types */

  const { editorMode } = navigationContainer.state;
  const isViewMode = editorMode === 'view';

  return (
    <>
      {isViewMode && (
        <>
          {pageContainer.isAbleToShowPageReactionButtons && <PageReactionButtons appContainer={appContainer} pageContainer={pageContainer} />}
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
