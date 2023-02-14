import { isClient, ColorScheme } from '@growi/core';
import { ThemeProvider, useTheme } from 'next-themes';
import { ThemeProviderProps, UseThemeProps } from 'next-themes/dist/types';

import { useForcedColorScheme } from './context';

export const Themes = {
  ...ColorScheme,
  SYSTEM: 'system',
} as const;
export type Themes = typeof Themes[keyof typeof Themes];


const ATTRIBUTE = 'data-theme';

export const NextThemesProvider: React.FC<ThemeProviderProps> = (props) => {
  const { data: forcedColorScheme } = useForcedColorScheme();

  return <ThemeProvider {...props} forcedTheme={forcedColorScheme} attribute={ATTRIBUTE} />;
};

type UseThemeExtendedProps = Omit<UseThemeProps, 'theme'|'resolvedTheme'> & {
  theme: Themes,
  resolvedTheme: ColorScheme,
  useOsSettings: boolean,
  isDarkMode: boolean,
  resolvedThemeByAttributes?: ColorScheme,
}

export const useNextThemes = (): UseThemeProps & UseThemeExtendedProps => {
  const props = useTheme();

  return Object.assign(props, {
    theme: props.theme as Themes,
    resolvedTheme: props.resolvedTheme as ColorScheme,
    useOsSettings: props.theme === Themes.SYSTEM,
    isDarkMode: props.resolvedTheme === ColorScheme.DARK,
    resolvedThemeByAttributes: isClient() ? document.documentElement.getAttribute(ATTRIBUTE) as ColorScheme : undefined,
  });
};
