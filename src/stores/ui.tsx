import { responseInterface } from 'swr';

import {
  useTrash, useNotFound, useCurrentPagePath, useCurrentUser, useIsSharedUser,
} from './context';
import { useCurrentPageDeleted, useDescendentsCount } from './page';
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

export const useIsAbleToShowPageReactionButtons = (): responseInterface<boolean, any> => {
  const { data: isTrashPage } = useTrash();
  const { data: isNotFountPage } = useNotFound();
  const { data: isSharedUser } = useIsSharedUser();

  return useStaticSWR('isAbleToShowPageReactionButtons', !isTrashPage && !isNotFountPage && !isSharedUser);
};
