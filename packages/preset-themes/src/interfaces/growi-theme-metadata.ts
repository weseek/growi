export const GrowiThemeSchemeType = {
  BOTH: 'both',
  LIGHT: 'light',
  DARK: 'dark',
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
  lightIcon: string,
  darkIcon: string,
  createBtn: string,
  isPresetTheme?: boolean,
};
