import React, { useCallback } from 'react';

import SubscribeButton from '../SubscribeButton';
import PageReactionButtons from '../PageReactionButtons';
import { useSWRPageInfo } from '../../stores/page';
import { useSWRBookmarkInfo } from '../../stores/bookmark';
import { toastError } from '../../client/util/apiNotification';
import { apiv3Put } from '../../client/util/apiv3-client';
import { useSWRxLikerList } from '../../stores/user';
import { useIsGuestUser } from '~/stores/context';


type SubNavButtonsSubstanceProps= {
  isCompactMode?: boolean,
  showPageControlDropdown?: boolean,
}
const SubNavButtonsSubstance = (props: { pageId: string } & SubNavButtonsSubstanceProps): JSX.Element => {
  const {
    isCompactMode, pageId, showPageControlDropdown,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  const { data: pageInfo, error: pageInfoError, mutate: mutatePageInfo } = useSWRPageInfo(pageId);
  const { data: likers } = useSWRxLikerList(pageInfo?.likerIds);
  const { data: bookmarkInfo, error: bookmarkInfoError, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(pageId, true);

  const likeClickhandler = useCallback(async() => {
    if (isGuestUser == null || isGuestUser) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await apiv3Put('/page/likes', { pageId, bool: !pageInfo!.isLiked });
      mutatePageInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [isGuestUser, mutatePageInfo, pageId, pageInfo]);

  const bookmarkClickHandler = useCallback(async() => {
    if (isGuestUser == null || isGuestUser) {
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await apiv3Put('/bookmarks', { pageId, bool: !bookmarkInfo!.isBookmarked });
      mutateBookmarkInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [bookmarkInfo, isGuestUser, mutateBookmarkInfo, pageId]);


  if (pageInfoError != null || pageInfo == null) {
    return <></>;
  }

  if (bookmarkInfoError != null || bookmarkInfo == null) {
    return <></>;
  }

  const { sumOfLikers, isLiked } = pageInfo;
  const { sumOfBookmarks, isBookmarked, bookmarkedUsers } = bookmarkInfo;

  return (
    <div className="d-flex" style={{ gap: '2px' }}>
      <span>
        <SubscribeButton pageId={props.pageId} />
      </span>
      <PageReactionButtons
        isCompactMode={isCompactMode}
        sumOfLikers={sumOfLikers}
        isLiked={isLiked}
        likers={likers || []}
        onLikeClicked={likeClickhandler}
        sumOfBookmarks={sumOfBookmarks}
        isBookmarked={isBookmarked}
        bookmarkedUsers={bookmarkedUsers}
        onBookMarkClicked={bookmarkClickHandler}
      >
      </PageReactionButtons>

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

type SubNavButtonsProps= SubNavButtonsSubstanceProps & {
  pageId?: string | null,
};

export const SubNavButtons = (props: SubNavButtonsProps): JSX.Element => {
  const { pageId, isCompactMode } = props;

  if (pageId == null) {
    return <></>;
  }

  return <SubNavButtonsSubstance pageId={pageId} isCompactMode={isCompactMode} />;
};
