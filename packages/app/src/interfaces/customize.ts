import type { ColorScheme, GrowiThemeMetadata } from '@growi/core';

export type IResLayoutSetting = {
  isContainerFluid: boolean,
};

export type IResGrowiTheme = {
  currentTheme: string,
  currentForcedColorScheme: ColorScheme,
  pluginThemesMetadatas: GrowiThemeMetadata[],
}
