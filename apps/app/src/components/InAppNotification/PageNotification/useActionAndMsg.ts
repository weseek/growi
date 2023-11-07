import type { HasObjectId } from '@growi/core';

import { SupportedAction } from '~/interfaces/activity';
import type { IInAppNotification } from '~/interfaces/in-app-notification';

export type ActionMsgAndIconType = {
  actionMsg: string
  actionIcon: string
}

export const useActionMsgAndIconForPageModelNotification = (notification: IInAppNotification & HasObjectId): ActionMsgAndIconType => {
  const actionType: string = notification.action;
  let actionMsg: string;
  let actionIcon: string;

  switch (actionType) {
    case SupportedAction.ACTION_PAGE_LIKE:
      actionMsg = 'liked';
      actionIcon = 'icon-like';
      break;
    case SupportedAction.ACTION_PAGE_BOOKMARK:
      actionMsg = 'bookmarked on';
      actionIcon = 'icon-star';
      break;
    case SupportedAction.ACTION_PAGE_UPDATE:
      actionMsg = 'updated on';
      actionIcon = 'ti ti-agenda';
      break;
    case SupportedAction.ACTION_PAGE_RENAME:
      actionMsg = 'renamed';
      actionIcon = 'icon-action-redo';
      break;
    case SupportedAction.ACTION_PAGE_DUPLICATE:
      actionMsg = 'duplicated';
      actionIcon = 'icon-docs';
      break;
    case SupportedAction.ACTION_PAGE_DELETE:
      actionMsg = 'deleted';
      actionIcon = 'icon-trash';
      break;
    case SupportedAction.ACTION_PAGE_DELETE_COMPLETELY:
      actionMsg = 'completely deleted';
      actionIcon = 'icon-fire';
      break;
    case SupportedAction.ACTION_PAGE_REVERT:
      actionMsg = 'reverted';
      actionIcon = 'icon-action-undo';
      break;
    case SupportedAction.ACTION_PAGE_RECURSIVELY_RENAME:
      actionMsg = 'renamed under';
      actionIcon = 'icon-action-redo';
      break;
    case SupportedAction.ACTION_PAGE_RECURSIVELY_DELETE:
      actionMsg = 'deleted under';
      actionIcon = 'icon-trash';
      break;
    case SupportedAction.ACTION_PAGE_RECURSIVELY_DELETE_COMPLETELY:
      actionMsg = 'deleted completely under';
      actionIcon = 'icon-fire';
      break;
    case SupportedAction.ACTION_PAGE_RECURSIVELY_REVERT:
      actionMsg = 'reverted under';
      actionIcon = 'icon-action-undo';
      break;
    case SupportedAction.ACTION_COMMENT_CREATE:
      actionMsg = 'commented on';
      actionIcon = 'icon-bubble';
      break;
    default:
      actionMsg = '';
      actionIcon = '';
  }

  return {
    actionMsg,
    actionIcon,
  };
};

export const useActionMsgAndIconForUserModelNotification = (notification: IInAppNotification & HasObjectId): ActionMsgAndIconType => {
  const actionType: string = notification.action;
  let actionMsg: string;
  let actionIcon: string;

  switch (actionType) {
    case SupportedAction.ACTION_USER_REGISTRATION_APPROVAL_REQUEST:
      actionMsg = 'requested registration approval';
      actionIcon = 'icon-bubble';
      break;
    default:
      actionMsg = '';
      actionIcon = '';
  }

  return {
    actionMsg,
    actionIcon,
  };
};
