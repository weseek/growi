import { useTheme } from 'next-themes';
import { UseThemeProps } from 'next-themes/dist/types';

export const Themes = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const;
export type Themes = typeof Themes[keyof typeof Themes];

export type NextThemesComputedValues = {
  useOsSettings: boolean,
  isDarkMode: boolean,
}

export const useNextThemes = (): UseThemeProps & NextThemesComputedValues => {
  const props = useTheme();
  return Object.assign(props, {
    useOsSettings: props.theme === Themes.system,
    isDarkMode: props.resolvedTheme === Themes.dark,
  });
};
