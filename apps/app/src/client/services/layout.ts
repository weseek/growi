import type { IPage } from '@growi/core';

import { useIsContainerFluid } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';
import { useEditorMode } from '~/stores/ui';

export const useEditorModeClassName = (): string => {
  const { getClassNamesByEditorMode } = useEditorMode();

  return `${getClassNamesByEditorMode().join(' ') ?? ''}`;
};

export const useCurrentGrowiLayoutFluidClassName = (initialPage?: IPage): string => {
  const { data: currentPage } = useSWRxCurrentPage();

  const { data: dataIsContainerFluid } = useIsContainerFluid();

  const page = currentPage ?? initialPage;
  const isContainerFluidEachPage = page == null || !('expandContentWidth' in page)
    ? null
    : page.expandContentWidth;
  const isContainerFluidDefault = dataIsContainerFluid;
  const isContainerFluid = isContainerFluidEachPage ?? isContainerFluidDefault;

  return isContainerFluid ? 'growi-layout-fluid' : '';
};
