import React, {
  forwardRef, ForwardRefRenderFunction,
} from 'react';

import type { HasObjectId } from '@growi/core';
import { useRouter } from 'next/router';

import { SupportedAction } from '~/interfaces/activity';
import type { IInAppNotificationOpenable } from '~/client/interfaces/in-app-notification-openable';
import type { IInAppNotification } from '~/interfaces/in-app-notification';

import { ModelNotification } from './ModelNotification';

interface Props {
  notification: IInAppNotification & HasObjectId
  actionUsers: string
}

type useActionMsgAndIconType = {
  actionMsg: string
  actionIcon: string
}

const useActionMsgAndIcon = (notification: IInAppNotification & HasObjectId): useActionMsgAndIconType => {
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
    default:
      actionMsg = '';
      actionIcon = '';

  return {
    actionMsg,
    actionIcon
  };
};

const PageModelNotification: ForwardRefRenderFunction<IInAppNotificationOpenable, Props> = (props: Props, ref) => {

  const {
    notification, actionUsers,
  } = props;

  const actionData = useActionMsgAndIcon(notification);
  const actionMsg = actionData.actionMsg;
  const actionIcon = actionData.actionIcon;

  const router = useRouter();

  // publish open()
  const publishOpen = () => {
    if (notification.target != null) {
      // jump to target page
      const targetPagePath = notification.target.path;
      if (targetPagePath != null) {
        router.push(targetPagePath);
      }
    }
  };

  return (
    <ModelNotification
      notification={notification}
      actionMsg={actionMsg}
      actionIcon={actionIcon}
      actionUsers={actionUsers}
      publishOpen={publishOpen}
      ref={ref}
    />
  );
};

export default forwardRef(PageModelNotification);
