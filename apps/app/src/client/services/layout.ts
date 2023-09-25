import type { IPage } from '@growi/core';

import { useIsContainerFluid } from '~/stores/context';
import { useEditorMode } from '~/stores/ui';

export const useEditorModeClassName = (): string => {
  const { getClassNamesByEditorMode } = useEditorMode();

  return `${getClassNamesByEditorMode().join(' ') ?? ''}`;
};

export const useLayoutFluidClassName = (expandContentWidth?: boolean | null): string => {
  const { data: dataIsContainerFluid } = useIsContainerFluid();

  const isContainerFluidDefault = dataIsContainerFluid;
  const isContainerFluid = expandContentWidth ?? isContainerFluidDefault;

  return isContainerFluid ? 'growi-layout-fluid' : '';
};

export const useLayoutFluidClassNameByPage = (initialPage?: IPage): string => {
  const page = initialPage;
  const expandContentWidth = page == null || !('expandContentWidth' in page)
    ? null
    : page.expandContentWidth;

  return useLayoutFluidClassName(expandContentWidth);
};
