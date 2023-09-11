import React, { useCallback, useMemo } from 'react';

import type {
  IPageInfoForOperation, IPageToDeleteWithMeta, IPageToRenameWithMeta,
} from '@growi/core';
import {
  isIPageInfoForEntity, isIPageInfoForOperation,
} from '@growi/core';
import { DropdownItem } from 'reactstrap';

import {
  toggleLike, toggleSubscribe,
} from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import { useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { IPageForPageDuplicateModal } from '~/stores/modal';

import { useSWRxPageInfo } from '../../stores/page';
import { useSWRxUsersList } from '../../stores/user';
import { BookmarkButtons } from '../BookmarkButtons';
import {
  AdditionalMenuItemsRendererProps, ForceHideMenuItems, MenuItemType,
  PageItemControl,
} from '../Common/Dropdown/PageItemControl';
import LikeButtons from '../LikeButtons';
import {
  WideViewMenuItem,
  CommunicationMenuItems,
} from '../SubNavButtons';
import SubscribeButton from '../SubscribeButton';
import SeenUserInfo from '../User/SeenUserInfo';


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
  onClickWorkflowMenuItem?: () => void,
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
    onClickDuplicateMenuItem, onClickRenameMenuItem, onClickDeleteMenuItem, onClickSwitchContentWidth, onClickWorkflowMenuItem,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  const { mutate: mutatePageInfo } = useSWRxPageInfo(pageId, shareLinkId);

  const likerIds = isIPageInfoForEntity(pageInfo) ? (pageInfo.likerIds ?? []).slice(0, 15) : [];
  const seenUserIds = isIPageInfoForEntity(pageInfo) ? (pageInfo.seenUserIds ?? []).slice(0, 15) : [];

  // Put in a mixture of seenUserIds and likerIds data to make the cache work
  const { data: usersList } = useSWRxUsersList([...likerIds, ...seenUserIds]);
  const likers = usersList != null ? usersList.filter(({ _id }) => likerIds.includes(_id)).slice(0, 15) : [];
  const seenUsers = usersList != null ? usersList.filter(({ _id }) => seenUserIds.includes(_id)).slice(0, 15) : [];

  const subscribeClickhandler = useCallback(async() => {
    if (isGuestUser ?? true) {
      return;
    }
    if (!isIPageInfoForOperation(pageInfo)) {
      return;
    }

    await toggleSubscribe(pageId, pageInfo.subscriptionStatus);
    mutatePageInfo();
  }, [isGuestUser, mutatePageInfo, pageId, pageInfo]);

  const likeClickhandler = useCallback(async() => {
    if (isGuestUser ?? true) {
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
    if (onClickSwitchContentWidth == null || (isGuestUser ?? true) || (isReadOnlyUser ?? true)) {
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
  }, [isGuestUser, isReadOnlyUser, onClickSwitchContentWidth, pageId, pageInfo]);

  const workflowMenuItemClickHandler = useCallback(async() => {
    if (onClickWorkflowMenuItem == null) {
      return;
    }

    onClickWorkflowMenuItem();
  }, [onClickWorkflowMenuItem]);

  const additionalMenuItemOnTopRenderer = useMemo(() => {
    if (!isIPageInfoForEntity(pageInfo)) {
      return undefined;
    }
    const TopMenuItemRenderer = () => {
      return (
        <>
          <WideViewMenuItem onClickMenuItem={switchContentWidthClickHandler} expandContentWidth={expandContentWidth} />
          <DropdownItem divider />
          <CommunicationMenuItems onClickWokflowMenuItem={workflowMenuItemClickHandler} />
        </>
      );
    };
    return TopMenuItemRenderer;
  }, [pageInfo, switchContentWidthClickHandler, workflowMenuItemClickHandler, expandContentWidth]);

  if (!isIPageInfoForOperation(pageInfo)) {
    return <></>;
  }

  const {
    sumOfLikers, sumOfSeenUsers, isLiked,
  } = pageInfo;

  const forceHideMenuItemsWithAdditions = [
    ...(forceHideMenuItems ?? []),
    MenuItemType.BOOKMARK,
    MenuItemType.REVERT,
  ];

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
          pageId={pageId}
          isBookmarked={pageInfo.isBookmarked}
          bookmarkCount={pageInfo.bookmarkCount}
          hideTotalNumber={isCompactMode}
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
          alignEnd
          pageId={pageId}
          pageInfo={pageInfo}
          isEnableActions={!isGuestUser}
          isReadOnlyUser={!!isReadOnlyUser}
          forceHideMenuItems={forceHideMenuItemsWithAdditions}
          additionalMenuItemOnTopRenderer={!isReadOnlyUser ? additionalMenuItemOnTopRenderer : undefined}
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
