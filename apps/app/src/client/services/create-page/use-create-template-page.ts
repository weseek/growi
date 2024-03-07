import { useCallback } from 'react';

import { Origin } from '@growi/core';
import { isCreatablePage } from '@growi/core/dist/utils/page-path-utils';
import { normalizePath } from '@growi/core/dist/utils/path-utils';

import type { LabelType } from '~/interfaces/template';
import { useCurrentPagePath } from '~/stores/page';


import { useCreatePageAndTransit } from './use-create-page-and-transit';

type UseCreateTemplatePage = () => {
  isCreatable: boolean,
  isCreating: boolean,
  createTemplate?: (label: LabelType) => Promise<void>,
}

export const useCreateTemplatePage: UseCreateTemplatePage = () => {

  const { data: currentPagePath, isLoading: isLoadingPagePath } = useCurrentPagePath();

  const { isCreating, createAndTransit } = useCreatePageAndTransit();
  const isCreatable = currentPagePath != null && isCreatablePage(normalizePath(`${currentPagePath}/_template`));

  const createTemplate = useCallback(async(label: LabelType) => {
    if (isLoadingPagePath || !isCreatable) return;

    return createAndTransit(
      { path: normalizePath(`${currentPagePath}/${label}`), wip: false, origin: Origin.View },
      { shouldCheckPageExists: true },
    );
  }, [currentPagePath, isCreatable, isLoadingPagePath, createAndTransit]);

  return {
    isCreatable,
    isCreating,
    createTemplate: isCreatable ? createTemplate : undefined,
  };
};
