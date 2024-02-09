import { useCallback } from 'react';

import { useCreatePageAndTransit } from '~/client/services/create-page';
import { useCurrentPagePath } from '~/stores/page';


type UseCreateNewPage = () => {
  isCreating: boolean,
  createNewPage: () => Promise<void>,
}

export const useCreateNewPage: UseCreateNewPage = () => {
  const { data: currentPagePath, isLoading: isLoadingPagePath } = useCurrentPagePath();

  const { isCreating, createAndTransit } = useCreatePageAndTransit();

  const createNewPage = useCallback(async() => {
    if (isLoadingPagePath) return;

    return createAndTransit(
      { parentPath: currentPagePath },
    );
  }, [createAndTransit, currentPagePath, isLoadingPagePath]);

  return {
    isCreating,
    createNewPage,
  };
};
