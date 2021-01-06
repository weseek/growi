import { responseInterface } from 'swr';

import { useCurrentPagePath, useCurrentUser } from './context';
import { useCurrentPageDeleted, useDescendentsCount } from './page';
import { useStaticSWR } from './use-static-swr';

export const useIsAbleToShowEmptyTrashButton = (): responseInterface<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: descendentsCount } = useDescendentsCount(currentPagePath);

  const hasChildren = (descendentsCount || 0) > 0;

  return currentUser != null && currentUser.admin && currentPagePath === '/trash' && hasChildren;
};

export const useIsAbleToShowTrashPageManagementButtons = (): responseInterface<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();
  const { data: isDeleted } = useCurrentPageDeleted();

  return useStaticSWR('isAbleToShowTrashPageManagementButtons', isDeleted && currentUser != null);
};
