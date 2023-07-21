import type { GrowiThemeMetadata } from '@growi/core/dist/interfaces';

export type IResLayoutSetting = {
  isContainerFluid: boolean,
};

export type IResGrowiTheme = {
  currentTheme: string,
  pluginThemesMetadatas: GrowiThemeMetadata[],
}
