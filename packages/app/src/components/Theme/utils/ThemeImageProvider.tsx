import { GrowiThemes } from '~/interfaces/theme';
import { Themes } from '~/stores/use-next-themes';

import { getBackgroundImageSrc as getHalloweenBackgroundImageSrc } from '../ThemeHalloween';
import { getBackgroundImageSrc as getHuffulePuffBackgroundImageSrc } from '../ThemeHufflepuff';
import { getBackgroundImageSrc as getIslandBackgroundImageSrc } from '../ThemeIsland';
import { getBackgroundImageSrc as getSpringBackgroundImageSrc } from '../ThemeSpring';
import { getBackgroundImageSrc as getWoodBackgroundImageSrc } from '../ThemeWood';

export const getBackgroundImageSrc = (theme: GrowiThemes | undefined, colorScheme: Themes | undefined): string | undefined => {
  if (theme == null || colorScheme == null) {
    return undefined;
  }
  switch (theme) {
    case GrowiThemes.ISLAND:
      return getIslandBackgroundImageSrc(colorScheme);
    case GrowiThemes.HUFFLEPUFF:
      return getHuffulePuffBackgroundImageSrc(colorScheme);
    case GrowiThemes.SPRING:
      return getSpringBackgroundImageSrc(colorScheme);
    case GrowiThemes.WOOD:
      return getWoodBackgroundImageSrc(colorScheme);
    default:
      return undefined;
  }
};
