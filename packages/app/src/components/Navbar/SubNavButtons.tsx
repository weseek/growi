import React, { useCallback } from 'react';

import { toastError } from '../../client/util/apiNotification';
import { apiv3Put } from '../../client/util/apiv3-client';

import { IPageInfo, isExistPageInfo } from '~/interfaces/page';

import { useSWRPageInfo } from '../../stores/page';
import { useSWRBookmarkInfo } from '../../stores/bookmark';
import { useSWRxUsersList } from '../../stores/user';
import { useIsGuestUser } from '~/stores/context';

import SubscribeButton from '../SubscribeButton';
import LikeButtons from '../LikeButtons';
import BookmarkButtons from '../BookmarkButtons';
import { SubscriptionStatusType } from '~/interfaces/subscription';


type CommonProps = {
  isCompactMode?: boolean,
  showPageControlDropdown?: boolean,
}

type SubNavButtonsSubstanceProps= CommonProps & {
  pageId: string,
  pageInfo: IPageInfo,
}

const SubNavButtonsSubstance = (props: SubNavButtonsSubstanceProps): JSX.Element => {
  const {
    pageInfo, pageId, isCompactMode, showPageControlDropdown,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  const { mutate: mutatePageInfo } = useSWRPageInfo(pageId);

  const { data: likers } = useSWRxUsersList(pageInfo.likerIds);
  const { data: bookmarkInfo, error: bookmarkInfoError, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(pageId, true);

  const subscribeClickhandler = useCallback(async() => {
    if (isGuestUser == null || isGuestUser) {
      return;
    }

    const newStatus = pageInfo.subscriptionStatus === SubscriptionStatusType.SUBSCRIBE
      ? SubscriptionStatusType.UNSUBSCRIBE
      : SubscriptionStatusType.SUBSCRIBE;

    try {
      await apiv3Put('/page/subscribe', { pageId, status: newStatus });
      mutatePageInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [isGuestUser, mutatePageInfo, pageId, pageInfo]);

  const likeClickhandler = useCallback(async() => {
    if (isGuestUser == null || isGuestUser) {
      return;
    }

    try {
      await apiv3Put('/page/likes', { pageId, bool: !pageInfo.isLiked });
      mutatePageInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [isGuestUser, mutatePageInfo, pageId, pageInfo]);

  const bookmarkClickHandler = useCallback(async() => {
    if (isGuestUser == null || isGuestUser || bookmarkInfo == null) {
      return;
    }
    try {
      await apiv3Put('/bookmarks', { pageId, bool: !bookmarkInfo.isBookmarked });
      mutateBookmarkInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkInfo, isGuestUser, mutateBookmarkInfo, pageId]);


  if (bookmarkInfoError != null || bookmarkInfo == null) {
    return <></>;
  }

  const { sumOfLikers, isLiked } = pageInfo;
  const { sumOfBookmarks, isBookmarked, bookmarkedUsers } = bookmarkInfo;

  return (
    <div className="d-flex" style={{ gap: '2px' }}>
      <span>
        <SubscribeButton
          status={pageInfo.subscriptionStatus}
          onClick={subscribeClickhandler}
        />
      </span>
      <LikeButtons
        hideTotalNumber={isCompactMode}
        onLikeClicked={likeClickhandler}
        sumOfLikers={sumOfLikers}
        isLiked={isLiked}
        likers={likers}
      />
      <BookmarkButtons
        hideTotalNumber={isCompactMode}
        sumOfBookmarks={sumOfBookmarks}
        isBookmarked={isBookmarked}
        bookmarkedUsers={bookmarkedUsers}
        onBookMarkClicked={bookmarkClickHandler}
      />
      { showPageControlDropdown && (
        /*
          TODO:
          replace with PageItemControl
        */
        <></>
        // <PageManagement
        //   pageId={pageId}
        //   revisionId={revisionId}
        //   path={path}
        //   isCompactMode={isCompactMode}
        //   isDeletable={isDeletable}
        //   isAbleToDeleteCompletely={isAbleToDeleteCompletely}
        // >
        // </PageManagement>
      )}
    </div>
  );
};

type SubNavButtonsProps= CommonProps & {
  pageId?: string | null,
};

export const SubNavButtons = (props: SubNavButtonsProps): JSX.Element => {
  const { pageId, isCompactMode } = props;

  const { data: pageInfo, error } = useSWRPageInfo(pageId ?? null);

  if (pageId == null || pageInfo == null || error != null) {
    return <></>;
  }

  if (!isExistPageInfo(pageInfo)) {
    return <></>;
  }

  return <SubNavButtonsSubstance pageInfo={pageInfo} pageId={pageId} isCompactMode={isCompactMode} />;
};
