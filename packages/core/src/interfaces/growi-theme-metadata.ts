import { ColorScheme } from './color-scheme';

export const GrowiThemeSchemeType = {
  ...ColorScheme,
  BOTH: 'both',
} as const;
export type GrowiThemeSchemeType = typeof GrowiThemeSchemeType[keyof typeof GrowiThemeSchemeType];

export type GrowiThemeMetadata = {
  name: string,
  manifestKey: string,
  schemeType: GrowiThemeSchemeType,
  lightBg: string,
  darkBg: string,
  lightSidebar: string,
  darkSidebar: string,
  createBtn: string,
  isPresetTheme?: boolean,
};
