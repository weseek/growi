import { GrowiThemes } from '~/interfaces/theme';
import { Themes } from '~/stores/use-next-themes';

import { getBackgroundImageSrc as getWoodBackgroundImageSrc } from '../ThemeWood';

export const getBackgroundImageSrc = (theme: GrowiThemes | undefined, colorScheme: Themes | undefined): string | undefined => {
  if (theme == null || colorScheme == null) {
    return undefined;
  }
  switch (theme) {
    default:
      return undefined;
  }
};
