import React, {
  FC, useCallback,
} from 'react';
import AppContainer from '../../client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import PageReactionButtons from '../PageReactionButtons';
import PageManagement from '../Page/PageManagement';
import { useSWRPageInfo } from '../../stores/page';
import { useSWRBookmarkInfo } from '../../stores/bookmark';
import { toastError } from '../../client/util/apiNotification';
import { apiv3Put } from '../../client/util/apiv3-client';
import { useSWRxLikerList } from '../../stores/user';
import { useEditorMode } from '~/stores/ui';

type SubNavButtonsProps= {
  appContainer: AppContainer,
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
    appContainer, isCompactMode, pageId, revisionId, path, willShowPageManagement, isDeletable, isAbleToDeleteCompletely,
  } = props;
  const { data: editorMode } = useEditorMode();
  const isViewMode = editorMode === 'view';
  const { isGuestUser } = appContainer;

  const { data: pageInfo, error: pageInfoError, mutate: mutatePageInfo } = useSWRPageInfo(pageId);
  const { data: likers } = useSWRxLikerList(pageInfo?.likerIds);
  const { data: bookmarkInfo, error: bookmarkInfoError, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(pageId);

  const likeClickhandler = useCallback(async() => {
    const { isGuestUser } = appContainer;
    if (isGuestUser) {
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
  }, [pageInfo]);

  const bookmarkClickHandler = useCallback(async() => {
    if (isGuestUser) {
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
  }, [bookmarkInfo]);

  if (pageInfoError != null || pageInfo == null) {
    return <></>;
  }

  if (bookmarkInfoError != null || bookmarkInfo == null) {
    return <></>;
  }

  const { sumOfLikers, isLiked } = pageInfo;
  const { sumOfBookmarks, isBookmarked } = bookmarkInfo;

  return (
    <>
      {isViewMode && (
        <PageReactionButtons
          sumOfLikers={sumOfLikers}
          isLiked={isLiked}
          likers={likers || []}
          onLikeClicked={likeClickhandler}
          sumOfBookmarks={sumOfBookmarks}
          isBookmarked={isBookmarked}
          onBookMarkClicked={bookmarkClickHandler}
        >
        </PageReactionButtons>
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
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
const SubNavButtonsUnstatedWrapper = withUnstatedContainers(SubNavButtons, [AppContainer]);

// wrapping tsx component returned by withUnstatedContainers to avoid type error when this component used in other tsx components.
const SubNavButtonsWrapper = (props) => {
  return <SubNavButtonsUnstatedWrapper {...props}></SubNavButtonsUnstatedWrapper>;
};

export default SubNavButtonsWrapper;
