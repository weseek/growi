import { isClient } from '@growi/core';
import { ThemeProvider, useTheme } from 'next-themes';
import { ThemeProviderProps, UseThemeProps } from 'next-themes/dist/types';

export const Themes = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const;
export type Themes = typeof Themes[keyof typeof Themes];

export const ResolvedThemes = {
  light: Themes.light,
  dark: Themes.dark,
} as const;
export type ResolvedThemes = typeof ResolvedThemes[keyof typeof ResolvedThemes];
export const ColorScheme = ResolvedThemes;
export type ColorScheme = ResolvedThemes;


const ATTRIBUTE = 'data-theme';

export const NextThemesProvider: React.FC<ThemeProviderProps> = (props) => {
  return <ThemeProvider {...props} attribute={ATTRIBUTE} />;
};

type UseThemeExtendedProps = Omit<UseThemeProps, 'theme'|'resolvedTheme'> & {
  theme: Themes,
  resolvedTheme: ResolvedThemes,
  useOsSettings: boolean,
  isDarkMode: boolean,
  resolvedThemeByAttributes?: ResolvedThemes,
}

export const useNextThemes = (): UseThemeProps & UseThemeExtendedProps => {
  const props = useTheme();

  return Object.assign(props, {
    theme: props.theme as Themes,
    resolvedTheme: props.resolvedTheme as ResolvedThemes,
    useOsSettings: props.theme === Themes.system,
    isDarkMode: props.resolvedTheme === ResolvedThemes.dark,
    resolvedThemeByAttributes: isClient() ? document.documentElement.getAttribute(ATTRIBUTE) as ResolvedThemes : undefined,
  });
};
