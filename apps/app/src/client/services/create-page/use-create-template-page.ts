import { useCallback } from 'react';

import { Origin } from '@growi/core';
import { isCreatablePage } from '@growi/core/dist/utils/page-path-utils';
import { normalizePath } from '@growi/core/dist/utils/path-utils';

import type { LabelType } from '~/interfaces/template';
import { useCurrentPagePath } from '~/stores/page';

import { useCreatePage } from './use-create-page';

type UseCreateTemplatePage = () => {
  isCreatable: boolean;
  isCreating: boolean;
  createTemplate?: (label: LabelType) => Promise<void>;
};

export const useCreateTemplatePage: UseCreateTemplatePage = () => {
  const { data: currentPagePath, isLoading: isLoadingPagePath } = useCurrentPagePath();

  const { isCreating, create } = useCreatePage();
  const isCreatable = currentPagePath != null && isCreatablePage(normalizePath(`${currentPagePath}/_template`));

  const createTemplate = useCallback(
    async (label: LabelType) => {
      if (isLoadingPagePath || !isCreatable) {
        return;
      }

      return create({
        path: normalizePath(`${currentPagePath}/${label}`),
        parentPath: currentPagePath,
        wip: false,
        origin: Origin.View,
      });
    },
    [currentPagePath, isCreatable, isLoadingPagePath, create],
  );

  return {
    isCreatable,
    isCreating,
    createTemplate: isCreatable ? createTemplate : undefined,
  };
};
