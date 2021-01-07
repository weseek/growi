import { responseInterface } from 'swr';

import { useCurrentPagePath, useCurrentUser } from './context';
import { useCurrentPageDeleted, useDescendentsCount, useCurrentPageSWR } from './page';
import { isUserPage } from '../utils/path-utils';
import { useStaticSWR } from './use-static-swr';

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

export const useIsAbleToShowTagLabel = (): responseInterface<boolean, Error> => {
  const { data: page } = useCurrentPageSWR();
  const { path } = page;
  const isPageUsersHome = isUserPage(path);

  return useStaticSWR('isAbleToShowTagLabel', !isPageUsersHome && !isSharedUser);
};
