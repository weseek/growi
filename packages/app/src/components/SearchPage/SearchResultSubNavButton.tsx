import React, {
  FC, useState, useEffect,
} from 'react';
import AppContainer from '../../client/services/AppContainer';
import NavigationContainer from '../../client/services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import BookmarkButton from '../BookmarkButton';
import LikeButtons from '../LikeButtons';
import PageManagement from '../Page/PageManagement';
import { toastError } from '~/client/util/apiNotification';


type PageReactionButtonsProps = {
  appContainer: AppContainer,
  pageId: string,
}

const PageReactionButtons : React.FC<PageReactionButtonsProps> = (props: PageReactionButtonsProps) => {
  const { appContainer, pageId } = props;
  const LikeButtonsTypeAny : any = LikeButtons;
  const BookMarkButtonTypeAny: any = BookmarkButton;

  const [sumOflikers, setSumOfLikers] = useState(0);
  const [likers, setLikers] = useState([]);
  const [isLiked, setIsLiked] = useState(true);

  // component did mount
  useEffect(() => {
    const f = async() => {
      const {
        data: { likerIds, sumOfLikers, isLiked },
      } = await appContainer.apiv3Get('/page/info', { _id: pageId });

      setSumOfLikers(sumOfLikers);
      setLikers(likerIds);
      setIsLiked(isLiked);
    };
    f();
  }, []);

  const toggleLike = async() => {
    const { isGuestUser } = appContainer;
    if (isGuestUser) {
      return;
    }
    try {
      const id = pageId;
      const toggledIsLiked = isLiked;
      await appContainer.apiv3Put('/page/likes', { pageId: id, bool: toggledIsLiked });
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <span>
        <LikeButtonsTypeAny onClickInvoked={toggleLike} likers={likers} sumOfLikers={sumOflikers} isLiked={isLiked}></LikeButtonsTypeAny>
      </span>
      <span>
        {/* <BookmarkButton></BookmarkButton> */}
      </span>
    </>
  );
};

type Props = {
  appContainer: AppContainer,
  isCompactMode: boolean,

  pageId: string,
}

const SearchResultSubNavButton : FC<Props> = (props: Props) => {
  const {
    appContainer, isCompactMode, pageId,
  } = props;
  return (
    <>
      <PageReactionButtons appContainer={appContainer} pageId={pageId}></PageReactionButtons>
      {/*
        TODO : https://estoc.weseek.co.jp/redmine/issues/80789
        CONDITION :isAbleToShowPageManagement = !isNotFoundPage && !isTrashPage && !isSharedUser
      */}
      {/* if (CONDITION) then PageReactionButtons */}
    </>
  );
};

const SearchResultSubNavButtonWrapper = withUnstatedContainers(SearchResultSubNavButton, [AppContainer]);

export default SearchResultSubNavButtonWrapper;
