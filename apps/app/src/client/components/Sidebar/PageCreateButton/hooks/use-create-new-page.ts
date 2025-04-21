import { useCallback } from 'react';

import { Origin } from '@growi/core';

import { useCreatePage } from '~/client/services/create-page';
import { useCurrentPagePath } from '~/stores/page';

type UseCreateNewPage = () => {
  isCreating: boolean;
  createNewPage: () => Promise<void>;
};

export const useCreateNewPage: UseCreateNewPage = () => {
  const { data: currentPagePath, isLoading: isLoadingPagePath } = useCurrentPagePath();

  const { isCreating, create } = useCreatePage();

  const createNewPage = useCallback(async () => {
    if (isLoadingPagePath) {
      return;
    }

    return create(
      {
        parentPath: currentPagePath,
        optionalParentPath: '/',
        wip: true,
        origin: Origin.View,
      },
      {
        skipPageExistenceCheck: true,
      },
    );
  }, [create, currentPagePath, isLoadingPagePath]);

  return {
    isCreating,
    createNewPage,
  };
};
