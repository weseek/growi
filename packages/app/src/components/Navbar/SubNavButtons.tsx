import React, {
  FC, useCallback,
} from 'react';

import SubscribeButton from '../SubscribeButton';
import PageReactionButtons from '../PageReactionButtons';
import PageManagement from '../Page/PageManagement';
import { useSWRPageInfo } from '../../stores/page';
import { useSWRBookmarkInfo } from '../../stores/bookmark';
import { toastError } from '../../client/util/apiNotification';
import { apiv3Put } from '../../client/util/apiv3-client';
import { useSWRxLikerList } from '../../stores/user';
import { useEditorMode } from '~/stores/ui';
import { useIsGuestUser } from '~/stores/context';

type SubNavButtonsProps= {
  isCompactMode?: boolean,
  pageId: string,
  revisionId: string,
  path: string,
  willShowPageManagement: boolean,
  isDeletable: boolean,
  isAbleToDeleteCompletely: boolean,
}
const SubNavButtons: FC<SubNavButtonsProps> = (props: SubNavButtonsProps) => {
  const {
    isCompactMode, pageId, revisionId, path, willShowPageManagement, isDeletable, isAbleToDeleteCompletely,
  } = props;

  const { data: editorMode } = useEditorMode();
  const isViewMode = editorMode === 'view';

  const { data: isGuestUser } = useIsGuestUser();

  const { data: pageInfo, error: pageInfoError, mutate: mutatePageInfo } = useSWRPageInfo(pageId);
  const { data: likers } = useSWRxLikerList(pageInfo?.likerIds);
  const { data: bookmarkInfo, error: bookmarkInfoError, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(pageId);

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
  const { sumOfBookmarks, isBookmarked } = bookmarkInfo;

  return (
    <div className="d-flex" style={{ gap: '2px' }}>
      {isViewMode && (
        <>
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
            onBookMarkClicked={bookmarkClickHandler}
          >
          </PageReactionButtons>
        </>
      )}
      {willShowPageManagement && (
        <PageManagement
          pageId={pageId}
          revisionId={revisionId}
          path={path}
          isCompactMode={isCompactMode}
          isDeletable={isDeletable}
          isAbleToDeleteCompletely={isAbleToDeleteCompletely}
        >
        </PageManagement>
      )}
    </div>
  );
};

export default SubNavButtons;
