import React, { FC } from 'react';
import AppContainer from '../../client/services/AppContainer';
import NavigationContainer from '../../client/services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import BookmarkButton from '../BookmarkButton';
import LikeButtons from '../LikeButtons';
import PageManagement from '../Page/PageManagement';

type Props = {
  appContainer: AppContainer,
  navigationContainer: NavigationContainer,
  isCompactMode: boolean,
}

const PageReactionButtons = () => {
  return (
    <>
      <span>
        {/* <LikeButtons onClick={} pageId={} sumOfLikers={} isLiked={}></LikeButtons> */}
      </span>
      <span>
        <BookmarkButton></BookmarkButton>
      </span>
    </>
  );
};

const SearchResultSubNavButton : FC<Props> = (props: Props) => {
  const { appContainer, navigationContainer, isCompactMode } = props;

  return (
    <>
      <PageReactionButtons></PageReactionButtons>
      {/*
        TODO : https://estoc.weseek.co.jp/redmine/issues/80789
        CONDITION :isAbleToShowPageManagement = !isNotFoundPage && !isTrashPage && !isSharedUser
      */}
      {/* if (CONDITION) then PageReactionButtons */}
    </>
  );
};

const SearchResultSubNavButtonWrapper = withUnstatedContainers(SearchResultSubNavButton, [AppContainer, NavigationContainer]);

export default SearchResultSubNavButtonWrapper;
