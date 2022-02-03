import React, { useCallback } from 'react';

import { toastError } from '../../client/util/apiNotification';
import { apiv3Put } from '../../client/util/apiv3-client';

import { IPageInfo, isExistPageInfo } from '~/interfaces/page';
import { SubscriptionStatusType } from '~/interfaces/subscription';

import { useSWRxPageInfo } from '../../stores/page';
import { useSWRBookmarkInfo } from '../../stores/bookmark';
import { useSWRxUsersList } from '../../stores/user';
import { useIsGuestUser } from '~/stores/context';

import SubscribeButton from '../SubscribeButton';
import LikeButtons from '../LikeButtons';
import BookmarkButtons from '../BookmarkButtons';
import SeenUserInfo from '../User/SeenUserInfo';


type CommonProps = {
  isCompactMode?: boolean,
  disableSeenUserInfoPopover?: boolean,
  showPageControlDropdown?: boolean,
}

type SubNavButtonsSubstanceProps= CommonProps & {
  pageId: string,
  pageInfo: IPageInfo,
}

const SubNavButtonsSubstance = (props: SubNavButtonsSubstanceProps): JSX.Element => {
  const {
    pageInfo, pageId, isCompactMode, disableSeenUserInfoPopover, showPageControlDropdown,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  const { mutate: mutatePageInfo } = useSWRxPageInfo(pageId);

  const { data: bookmarkInfo, error: bookmarkInfoError, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(pageId);

  const likerIds = pageInfo.likerIds != null ? pageInfo.likerIds.slice(0, 15) : [];
  const seenUserIds = pageInfo.seenUserIds != null ? pageInfo.seenUserIds.slice(0, 15) : [];

  // Put in a mixture of seenUserIds and likerIds data to make the cache work
  const { data: usersList } = useSWRxUsersList([...likerIds, ...seenUserIds]);
  const likers = usersList != null ? usersList.filter(({ _id }) => likerIds.includes(_id)).slice(0, 15) : [];
  const seenUsers = usersList != null ? usersList.filter(({ _id }) => seenUserIds.includes(_id)).slice(0, 15) : [];

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
      <SeenUserInfo seenUsers={seenUsers} disabled={disableSeenUserInfoPopover} />
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

  const { data: pageInfo, error } = useSWRxPageInfo(pageId ?? null);

  if (pageId == null || pageInfo == null || error != null) {
    return <></>;
  }

  if (!isExistPageInfo(pageInfo)) {
    return <></>;
  }

  return <SubNavButtonsSubstance pageInfo={pageInfo} pageId={pageId} isCompactMode={isCompactMode} />;
};
