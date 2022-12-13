export const GrowiThemeSchemeType = {
  BOTH: 'both',
  LIGHT: 'light',
  DARK: 'dark',
} as const;
export type GrowiThemeSchemeType = typeof GrowiThemeSchemeType[keyof typeof GrowiThemeSchemeType];

export type GrowiThemeColorSummary = {
  name: string,
  schemeType: GrowiThemeSchemeType,
  bg: string,
  topbar: string,
  sidebar: string,
  theme: string,
};

export type GrowiCustomThemeSummary = GrowiThemeColorSummary & {
  manifestKey: string,
};
