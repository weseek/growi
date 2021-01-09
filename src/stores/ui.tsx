import { responseInterface } from 'swr';

import { isUserPage, isSharedPage } from '~/utils/path-utils';
import {
  useTrash, useNotFound, useCurrentPagePath, useCurrentUser, useIsSharedUser,
} from './context';
import { useCurrentPageDeleted, useDescendentsCount, useCurrentPageSWR } from './page';
import { useStaticSWR } from './use-static-swr';
import { Page } from '~/interfaces/page';

export const useIsAbleToShowEmptyTrashButton = (): responseInterface<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: descendentsCount } = useDescendentsCount(currentPagePath);

  const hasChildren = (descendentsCount || 0) > 0;
  const isAbleToShowEmptyTrashButton = currentUser != null && currentUser.admin && currentPagePath === '/trash' && hasChildren;

  return useStaticSWR('isAbleToShowEmptyTrashButton', isAbleToShowEmptyTrashButton);
};

export const useIsAbleToShowTrashPageManagementButtons = (): responseInterface<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();
  const { data: isDeleted } = useCurrentPageDeleted();

  return useStaticSWR('isAbleToShowTrashPageManagementButtons', isDeleted && currentUser != null);
};

export const useIsAbleToShowPageReactionButtons = (): responseInterface<boolean, any> => {
  const { data: isTrashPage } = useTrash();
  const { data: isNotFountPage } = useNotFound();
  const { data: isSharedUser } = useIsSharedUser();

  return useStaticSWR('isAbleToShowPageReactionButtons', !isTrashPage && !isNotFountPage && !isSharedUser);
};

export const useIsAbleToShowLikeButton = (): responseInterface<boolean, any> => {
  const { data: isSharedUser } = useIsSharedUser();
  const { data: page } = useCurrentPageSWR();

  if (page == null) {
    throw new Error('page must not be null');
  }
  return useStaticSWR('isAbleToShowLikeButton', !isUserPage(page.path) && !isSharedUser);
};

export const useIsAbleToShowTagLabel = (): responseInterface<boolean, any> => {
  const { data: page } = useCurrentPageSWR();
  const { path } = page as Page;

  // [TODO: add other two judgements and expand isAbleToShowTagLabel by GW-4881]
  // isAbleToShowTagLabel = (!isCompactMode && !isUserPage && !isSharedPage && !(editorMode === 'view' && !isPageExist));
  return useStaticSWR('isAbleToShowTagLabel', !isUserPage(path) && !isSharedPage(path));
};
