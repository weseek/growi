import React, { useCallback, useMemo } from 'react';

import { useTranslation } from 'next-i18next';
import { DropdownItem } from 'reactstrap';

import {
  toggleLike, toggleSubscribe,
} from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import {
  IPageInfoForOperation, IPageToDeleteWithMeta, IPageToRenameWithMeta, isIPageInfoForEntity, isIPageInfoForOperation,
} from '~/interfaces/page';
import { useIsGuestUser } from '~/stores/context';
import { IPageForPageDuplicateModal } from '~/stores/modal';

import { useSWRBookmarkInfo } from '../../stores/bookmark';
import { useSWRxPageInfo } from '../../stores/page';
import { useSWRxUsersList } from '../../stores/user';
import { BookmarkButtons } from '../BookmarkButtons';
import {
  AdditionalMenuItemsRendererProps, ForceHideMenuItems, MenuItemType,
  PageItemControl,
} from '../Common/Dropdown/PageItemControl';
import LikeButtons from '../LikeButtons';
import SubscribeButton from '../SubscribeButton';
import SeenUserInfo from '../User/SeenUserInfo';


type WideViewMenuItemProps = AdditionalMenuItemsRendererProps & {
  onClickMenuItem: (newValue: boolean) => void,
  expandContentWidth?: boolean,
}

const WideViewMenuItem = (props: WideViewMenuItemProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    onClickMenuItem, expandContentWidth,
  } = props;

  return (
    <DropdownItem
      onClick={() => onClickMenuItem(!(expandContentWidth))}
      className="grw-page-control-dropdown-item"
    >
      <div className="custom-control custom-switch ml-1">
        <input
          id="switchContentWidth"
          className="custom-control-input"
          type="checkbox"
          checked={expandContentWidth}
          onChange={() => {}}
        />
        <label className="custom-control-label" htmlFor="switchContentWidth">
          { t('wide_view') }
        </label>
      </div>
    </DropdownItem>
  );
};


type CommonProps = {
  isCompactMode?: boolean,
  disableSeenUserInfoPopover?: boolean,
  showPageControlDropdown?: boolean,
  forceHideMenuItems?: ForceHideMenuItems,
  additionalMenuItemRenderer?: React.FunctionComponent<AdditionalMenuItemsRendererProps>,
  onClickDuplicateMenuItem?: (pageToDuplicate: IPageForPageDuplicateModal) => void,
  onClickRenameMenuItem?: (pageToRename: IPageToRenameWithMeta) => void,
  onClickDeleteMenuItem?: (pageToDelete: IPageToDeleteWithMeta) => void,
  onClickSwitchContentWidth?: (pageId: string, value: boolean) => void,
}

type SubNavButtonsSubstanceProps = CommonProps & {
  pageId: string,
  shareLinkId?: string | null,
  revisionId: string | null,
  path?: string | null,
  pageInfo: IPageInfoForOperation,
  expandContentWidth?: boolean,
}

const SubNavButtonsSubstance = (props: SubNavButtonsSubstanceProps): JSX.Element => {
  const {
    pageInfo,
    pageId, revisionId, path, shareLinkId, expandContentWidth,
    isCompactMode, disableSeenUserInfoPopover, showPageControlDropdown, forceHideMenuItems, additionalMenuItemRenderer,
    onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem, onClickSwitchContentWidth,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();

  const { mutate: mutatePageInfo } = useSWRxPageInfo(pageId, shareLinkId);

  const { data: bookmarkInfo } = useSWRBookmarkInfo(pageId);

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

    const page: IPageToRenameWithMeta = {
      data: {
        _id: pageId,
        revision: revisionId,
        path,
      },
      meta: pageInfo,
    };

    onClickRenameMenuItem(page);
  }, [onClickRenameMenuItem, pageId, pageInfo, path, revisionId]);

  const deleteMenuItemClickHandler = useCallback(async(_pageId: string): Promise<void> => {
    if (onClickDeleteMenuItem == null || path == null) {
      return;
    }

    const pageToDelete: IPageToDeleteWithMeta = {
      data: {
        _id: pageId,
        revision: revisionId,
        path,
      },
      meta: pageInfo,
    };

    onClickDeleteMenuItem(pageToDelete);
  }, [onClickDeleteMenuItem, pageId, pageInfo, path, revisionId]);

  const switchContentWidthClickHandler = useCallback(async(newValue: boolean) => {
    if (onClickSwitchContentWidth == null || isGuestUser == null || isGuestUser) {
      return;
    }
    if (!isIPageInfoForEntity(pageInfo)) {
      return;
    }
    try {
      onClickSwitchContentWidth(pageId, newValue);
    }
    catch (err) {
      toastError(err);
    }
  }, [isGuestUser, onClickSwitchContentWidth, pageId, pageInfo]);

  const additionalMenuItemOnTopRenderer = useMemo(() => {
    if (!isIPageInfoForEntity(pageInfo)) {
      return undefined;
    }
    const wideviewMenuItemRenderer = (props: WideViewMenuItemProps) => {

      return <WideViewMenuItem {...props} onClickMenuItem={switchContentWidthClickHandler} expandContentWidth={expandContentWidth} />;
    };
    return wideviewMenuItemRenderer;
  }, [pageInfo, switchContentWidthClickHandler, expandContentWidth]);

  if (!isIPageInfoForOperation(pageInfo)) {
    return <></>;
  }

  const {
    sumOfLikers, sumOfSeenUsers, isLiked,
  } = pageInfo;

  const forceHideMenuItemsWithBookmark = forceHideMenuItems ?? [];
  forceHideMenuItemsWithBookmark.push(MenuItemType.BOOKMARK);
  forceHideMenuItemsWithBookmark.push(MenuItemType.BOOKMARKS_TREE_MOVE_TO_ROOT);

  return (
    <div className="d-flex" style={{ gap: '2px' }}>
      {revisionId != null && (
        <SubscribeButton
          status={pageInfo.subscriptionStatus}
          onClick={subscribeClickhandler}
        />
      )}
      {revisionId != null && (
        <LikeButtons
          hideTotalNumber={isCompactMode}
          onLikeClicked={likeClickhandler}
          sumOfLikers={sumOfLikers}
          isLiked={isLiked}
          likers={likers}
        />
      )}
      {revisionId != null && (
        <BookmarkButtons
          hideTotalNumber={isCompactMode}
          bookmarkedUsers={bookmarkInfo?.bookmarkedUsers}
          bookmarkInfo={bookmarkInfo}
        />
      )}
      {revisionId != null && !isCompactMode && (
        <SeenUserInfo
          seenUsers={seenUsers}
          sumOfSeenUsers={sumOfSeenUsers}
          disabled={disableSeenUserInfoPopover}
        />
      ) }
      { showPageControlDropdown && (
        <PageItemControl
          alignRight
          pageId={pageId}
          pageInfo={pageInfo}
          isEnableActions={!isGuestUser}
          forceHideMenuItems={forceHideMenuItemsWithBookmark}
          additionalMenuItemOnTopRenderer={additionalMenuItemOnTopRenderer}
          additionalMenuItemRenderer={additionalMenuItemRenderer}
          onClickRenameMenuItem={renameMenuItemClickHandler}
          onClickDuplicateMenuItem={duplicateMenuItemClickHandler}
          onClickDeleteMenuItem={deleteMenuItemClickHandler}
        />
      )}
    </div>
  );
};

export type SubNavButtonsProps = CommonProps & {
  pageId: string,
  shareLinkId?: string | null,
  revisionId?: string | null,
  path?: string | null,
  expandContentWidth?: boolean,
};

export const SubNavButtons = (props: SubNavButtonsProps): JSX.Element => {
  const {
    pageId, revisionId, path, shareLinkId, expandContentWidth,
    onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem, onClickSwitchContentWidth,
  } = props;

  const { data: pageInfo, error } = useSWRxPageInfo(pageId ?? null, shareLinkId);

  if (error != null) {
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
      revisionId={revisionId ?? null}
      path={path}
      onClickDuplicateMenuItem={onClickDuplicateMenuItem}
      onClickRenameMenuItem={onClickRenameMenuItem}
      onClickDeleteMenuItem={onClickDeleteMenuItem}
      onClickSwitchContentWidth={onClickSwitchContentWidth}
      expandContentWidth={expandContentWidth}
    />
  );
};
