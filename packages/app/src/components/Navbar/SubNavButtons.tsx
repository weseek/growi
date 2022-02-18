import React, { useCallback } from 'react';

import { IPageInfoAll, isIPageInfoForEntity, isIPageInfoForOperation } from '~/interfaces/page';

import { useSWRxPageInfo } from '../../stores/page';
import { useSWRBookmarkInfo } from '../../stores/bookmark';
import { useSWRxUsersList } from '../../stores/user';
import { useIsGuestUser } from '~/stores/context';
import { IPageForPageDeleteModal, IPageForPageRenameModal, IPageForPageDuplicateModal } from '~/stores/modal';

import SubscribeButton from '../SubscribeButton';
import LikeButtons from '../LikeButtons';
import BookmarkButtons from '../BookmarkButtons';
import SeenUserInfo from '../User/SeenUserInfo';
import { toggleBookmark, toggleLike, toggleSubscribe } from '~/client/services/page-operation';
import {
  AdditionalMenuItemsRendererProps, ForceHideMenuItems, MenuItemType, PageItemControl,
} from '../Common/Dropdown/PageItemControl';


type CommonProps = {
  isCompactMode?: boolean,
  disableSeenUserInfoPopover?: boolean,
  showPageControlDropdown?: boolean,
  forceHideMenuItems?: ForceHideMenuItems,
  additionalMenuItemRenderer?: React.FunctionComponent<AdditionalMenuItemsRendererProps>,
  onClickDuplicateMenuItem?: (pageToDuplicate: IPageForPageDuplicateModal) => void,
  onClickRenameMenuItem?: (pageToRename: IPageForPageRenameModal) => void,
  onClickDeleteMenuItem?: (pageToDelete: IPageForPageDeleteModal) => void,
}

type SubNavButtonsSubstanceProps = CommonProps & {
  pageId: string,
  shareLinkId?: string | null,
  revisionId: string,
  path?: string | null,
  pageInfo: IPageInfoAll,
}

const SubNavButtonsSubstance = (props: SubNavButtonsSubstanceProps): JSX.Element => {
  const {
    pageInfo,
    pageId, revisionId, path, shareLinkId,
    isCompactMode, disableSeenUserInfoPopover, showPageControlDropdown, forceHideMenuItems, additionalMenuItemRenderer,
    onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  const { mutate: mutatePageInfo } = useSWRxPageInfo(pageId, shareLinkId);

  const { data: bookmarkInfo, mutate: mutateBookmarkInfo } = useSWRBookmarkInfo(pageId);

  const likerIds = isIPageInfoForEntity(pageInfo) ? (pageInfo.likerIds ?? []).slice(0, 15) : [];
  const seenUserIds = isIPageInfoForEntity(pageInfo) ? (pageInfo.seenUserIds ?? []).slice(0, 15) : [];

  // Put in a mixture of seenUserIds and likerIds data to make the cache work
  const { data: usersList } = useSWRxUsersList([...likerIds, ...seenUserIds]);
  const likers = usersList != null ? usersList.filter(({ _id }) => likerIds.includes(_id)).slice(0, 15) : [];
  const seenUsers = usersList != null ? usersList.filter(({ _id }) => seenUserIds.includes(_id)).slice(0, 15) : [];

  const subscribeClickhandler = useCallback(async() => {
    if (isGuestUser == null || isGuestUser) {
      return;
    }
    if (!isIPageInfoForOperation(pageInfo)) {
      return;
    }

    await toggleSubscribe(pageId, pageInfo.subscriptionStatus);
    mutatePageInfo();
  }, [isGuestUser, mutatePageInfo, pageId, pageInfo]);

  const likeClickhandler = useCallback(async() => {
    if (isGuestUser == null || isGuestUser) {
      return;
    }
    if (!isIPageInfoForOperation(pageInfo)) {
      return;
    }

    await toggleLike(pageId, pageInfo.isLiked);
    mutatePageInfo();
  }, [isGuestUser, mutatePageInfo, pageId, pageInfo]);

  const bookmarkClickHandler = useCallback(async() => {
    if (isGuestUser == null || isGuestUser) {
      return;
    }
    if (!isIPageInfoForOperation(pageInfo)) {
      return;
    }

    await toggleBookmark(pageId, pageInfo.isBookmarked);
    mutatePageInfo();
    mutateBookmarkInfo();
  }, [isGuestUser, mutateBookmarkInfo, mutatePageInfo, pageId, pageInfo]);

  const duplicateMenuItemClickHandler = useCallback(async(_pageId: string): Promise<void> => {
    if (onClickDuplicateMenuItem == null || path == null) {
      return;
    }
    const page: IPageForPageDuplicateModal = { pageId, path };

    onClickDuplicateMenuItem(page);
  }, [onClickDuplicateMenuItem, pageId, path]);

  const renameMenuItemClickHandler = useCallback(async(_pageId: string): Promise<void> => {
    if (onClickRenameMenuItem == null || path == null) {
      return;
    }
    const page: IPageForPageRenameModal = { pageId, revisionId, path };
    onClickRenameMenuItem(page);
  }, [onClickRenameMenuItem, pageId, path, revisionId]);

  const deleteMenuItemClickHandler = useCallback(async(_pageId: string): Promise<void> => {
    if (onClickDeleteMenuItem == null || path == null) {
      return;
    }

    const pageToDelete: IPageForPageDeleteModal = {
      pageId,
      revisionId,
      path,
      isAbleToDeleteCompletely: pageInfo.isAbleToDeleteCompletely,
    };

    onClickDeleteMenuItem(pageToDelete);
  }, [onClickDeleteMenuItem, pageId, pageInfo.isAbleToDeleteCompletely, path, revisionId]);

  if (!isIPageInfoForOperation(pageInfo)) {
    return <></>;
  }


  const {
    sumOfLikers, sumOfSeenUsers, isLiked, bookmarkCount, isBookmarked,
  } = pageInfo;

  const forceHideMenuItemsWithBookmark = forceHideMenuItems ?? [];
  forceHideMenuItemsWithBookmark.push(MenuItemType.BOOKMARK);

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
        bookmarkCount={bookmarkCount}
        isBookmarked={isBookmarked}
        bookmarkedUsers={bookmarkInfo?.bookmarkedUsers}
        onBookMarkClicked={bookmarkClickHandler}
      />
      { !isCompactMode && (
        <SeenUserInfo
          seenUsers={seenUsers}
          sumOfSeenUsers={sumOfSeenUsers}
          disabled={disableSeenUserInfoPopover}
        />
      ) }
      { showPageControlDropdown && (
        <PageItemControl
          dataTestId="sub-nav-buttons-page-item-control"
          pageId={pageId}
          pageInfo={pageInfo}
          isEnableActions={!isGuestUser}
          forceHideMenuItems={forceHideMenuItemsWithBookmark}
          additionalMenuItemRenderer={additionalMenuItemRenderer}
          onClickRenameMenuItem={renameMenuItemClickHandler}
          onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
          onClickDeleteMenuItem={deleteMenuItemClickHandler}
        />
      )}
    </div>
  );
};

type SubNavButtonsProps= CommonProps & {
  pageId: string,
  shareLinkId?: string | null,
  revisionId?: string | null,
  path?: string | null
};

export const SubNavButtons = (props: SubNavButtonsProps): JSX.Element => {
  const {
    pageId, revisionId, path, shareLinkId, onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem,
  } = props;

  const { data: pageInfo, error } = useSWRxPageInfo(pageId ?? null, shareLinkId);

  if (revisionId == null || error != null) {
    return <></>;
  }

  if (!isIPageInfoForOperation(pageInfo)) {
    return <></>;
  }


  return (
    <SubNavButtonsSubstance
      {...props}
      pageInfo={pageInfo}
      pageId={pageId}
      revisionId={revisionId}
      path={path}
      onClickDuplicateMenuItem={onClickDuplicateMenuItem}
      onClickRenameMenuItem={onClickRenameMenuItem}
      onClickDeleteMenuItem={onClickDeleteMenuItem}
    />
  );
};
