import { pagePathUtils } from '@growi/core/dist/utils';

import { SupportedAction } from '~/interfaces/activity';
import type { SupportedActionType } from '~/interfaces/activity';

import type { IPageToShowRevisionWithMeta } from './types';

export const getAction = (props: {
  isNotCreatable: boolean;
  isForbidden: boolean;
  isNotFound: boolean;
  pageWithMeta?: IPageToShowRevisionWithMeta | null;
}): SupportedActionType => {
  if (props.isNotCreatable) {
    return SupportedAction.ACTION_PAGE_NOT_CREATABLE;
  }
  if (props.isForbidden) {
    return SupportedAction.ACTION_PAGE_FORBIDDEN;
  }
  if (props.isNotFound) {
    return SupportedAction.ACTION_PAGE_NOT_FOUND;
  }
  if (pagePathUtils.isUsersHomepage(props.pageWithMeta?.data.path ?? '')) {
    return SupportedAction.ACTION_PAGE_USER_HOME_VIEW;
  }
  return SupportedAction.ACTION_PAGE_VIEW;
};
