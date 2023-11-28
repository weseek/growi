import type { IPage } from '@growi/core';

import { useIsContainerFluid } from '~/stores/context';
import { useEditorMode } from '~/stores/ui';

export const useEditorModeClassName = (): string => {
  const { getClassNamesByEditorMode } = useEditorMode();

  return `${getClassNamesByEditorMode().join(' ') ?? ''}`;
};

const useShouldLayoutFluid = (expandContentWidth?: boolean | null): boolean => {
  const { data: dataIsContainerFluid } = useIsContainerFluid();

  const isContainerFluidDefault = dataIsContainerFluid;
  return expandContentWidth ?? isContainerFluidDefault ?? false;
};

export const useLayoutFluid = (data?: IPage | boolean | null): boolean => {
  const expandContentWidth = (() => {
    // when data is null
    if (data == null) {
      return null;
    }
    // when data is boolean
    if (data === true || data === false) {
      return data;
    }
    // when IPage does not have expandContentWidth
    if (!('expandContentWidth' in data)) {
      return null;
    }
    return data.expandContentWidth;
  })();

  return useShouldLayoutFluid(expandContentWidth);
};
