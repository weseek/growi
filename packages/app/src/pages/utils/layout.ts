// Use `props.isContainerFluid` as default, `layoutSetting.isContainerFluid` as admin setting, `dataPageInfo.expandContentWidth` as each page's setting
export const calcIsContainerFluid = (
    isContainerFluidEachPage: boolean | undefined | null,
    isContainerFluidDefault: boolean,
    isContainerFluidAdmin: boolean | undefined,
): boolean => {
  const isContainerFluid = isContainerFluidEachPage == null
    ? isContainerFluidAdmin ?? isContainerFluidDefault
    : isContainerFluidEachPage ?? isContainerFluidAdmin ?? isContainerFluidDefault;

  return isContainerFluid;
};
