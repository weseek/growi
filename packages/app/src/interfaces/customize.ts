import { GrowiCustomThemeSummary } from '@growi/core';

export type IResLayoutSetting = {
  isContainerFluid: boolean,
};

export type IResGrowiTheme = {
  currentTheme: string,
  customThemeSummaries: GrowiCustomThemeSummary[],
}
