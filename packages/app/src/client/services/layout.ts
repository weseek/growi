import { useIsContainerFluid } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';
import { useEditorMode } from '~/stores/ui';

export const useEditorModeClassName = (): string => {
  const { getClassNamesByEditorMode } = useEditorMode();

  // TODO: Enable `editing-sidebar` class somehow
  // https://redmine.weseek.co.jp/issues/111527
  // const classNames: string[] = [];
  // if (currentPage != null) {
  //   const isSidebar = currentPage.path === '/Sidebar';
  //   classNames.push(...getClassNamesByEditorMode(/* isSidebar */));
  // }

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
