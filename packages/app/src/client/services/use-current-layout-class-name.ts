import { useIsContainerFluid, useShareLinkId } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';
import { useEditorMode } from '~/stores/ui';

export const useCurrentLayoutClassName = (): string => {
  const { data: shareLinkId } = useShareLinkId();
  const { data: currentPage } = useSWRxCurrentPage(shareLinkId ?? undefined);

  const { data: dataIsContainerFluid } = useIsContainerFluid();
  const { getClassNamesByEditorMode } = useEditorMode();

  const isContainerFluidEachPage = currentPage == null || !('expandContentWidth' in currentPage)
    ? null
    : currentPage.expandContentWidth;
  const isContainerFluidDefault = dataIsContainerFluid;
  const isContainerFluid = isContainerFluidEachPage ?? isContainerFluidDefault;

  const classNames: string[] = [];
  if (currentPage != null) {
    const isSidebar = currentPage.path === '/Sidebar';
    classNames.push(...getClassNamesByEditorMode(isSidebar));
  }

  const myClassName = `${classNames.join(' ') ?? ''} ${isContainerFluid ? 'growi-layout-fluid' : ''}`;

  return myClassName;
};
