import { responseInterface } from 'swr';

import { useCurrentPagePath, useCurrentUser } from './context';
import { useDescendentsCount } from './page';

export const useIsAbleToShowEmptyTrashButton = (): responseInterface<boolean, Error> => {
  const { data: currentUser } = useCurrentUser();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: descendentsCount } = useDescendentsCount(currentPagePath);

  const hasChildren = (descendentsCount || 0) > 0;

  return currentUser != null && currentUser.admin && currentPagePath === '/trash' && hasChildren;
};
