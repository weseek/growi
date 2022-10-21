
import React from 'react';

import dynamic from 'next/dynamic';

import { GrowiThemes } from '~/interfaces/theme';
import { Themes } from '~/stores/use-next-themes';


// const ThemeAntarctic = dynamic(() => import('../ThemeAntarctic'));
// const ThemeBlackboard = dynamic(() => import('../ThemeBlackboard'));
// const ThemeChristmas = dynamic(() => import('../ThemeChristmas'));
const ThemeDefault = dynamic(() => import('../ThemeDefault'));
// const ThemeFireRed = dynamic(() => import('../ThemeFireRed'));
// const ThemeFuture = dynamic(() => import('../ThemeFuture'));
// const ThemeHalloween = dynamic(() => import('../ThemeHalloween'));
// const ThemeHufflepuff = dynamic(() => import('../ThemeHufflepuff'));
// const ThemeIsland = dynamic(() => import('../ThemeIsland'));
// const ThemeJadeGreen = dynamic(() => import('../ThemeJadeGreen'));
// const ThemeKibela = dynamic(() => import('../ThemeKibela'));
// const ThemeMonoBlue = dynamic(() => import('../ThemeMonoBlue'));
// const ThemeNature = dynamic(() => import('../ThemeNature'));
// const ThemeSpring = dynamic(() => import('../ThemeSpring'));
// const ThemeWood = dynamic(() => import('../ThemeWood'));


type Props = {
  children: JSX.Element,
  theme?: GrowiThemes,
  colorScheme?: Themes,
}

export const ThemeProvider = ({ theme, children, colorScheme }: Props): JSX.Element => {
  switch (theme) {
    // case GrowiThemes.ANTARCTIC:
    //   return <ThemeAntarctic colorScheme={colorScheme}>{children}</ThemeAntarctic>;
    // case GrowiThemes.BLACKBOARD:
    //   return <ThemeBlackboard>{children}</ThemeBlackboard>;
    // case GrowiThemes.CHRISTMAS:
    //   return <ThemeChristmas colorScheme={colorScheme}>{children}</ThemeChristmas>;
    // case GrowiThemes.FIRE_RED:
    //   return <ThemeFireRed>{children}</ThemeFireRed>;
    // case GrowiThemes.FUTURE:
    //   return <ThemeFuture>{children}</ThemeFuture>;
    // case GrowiThemes.HALLOWEEN:
    //   return <ThemeHalloween colorScheme={colorScheme}>{children}</ThemeHalloween>;
    // case GrowiThemes.HUFFLEPUFF:
    //   return <ThemeHufflepuff colorScheme={colorScheme}>{children}</ThemeHufflepuff>;
    // case GrowiThemes.ISLAND:
    //   return <ThemeIsland colorScheme={colorScheme}>{children}</ThemeIsland>;
    // case GrowiThemes.JADE_GREEN:
    //   return <ThemeJadeGreen>{children}</ThemeJadeGreen>;
    // case GrowiThemes.KIBELA:
    //   return <ThemeKibela>{children}</ThemeKibela>;
    // case GrowiThemes.MONO_BLUE:
    //   return <ThemeMonoBlue>{children}</ThemeMonoBlue>;
    // case GrowiThemes.NATURE:
    //   return <ThemeNature>{children}</ThemeNature>;
    // case GrowiThemes.SPRING:
    //   return <ThemeSpring colorScheme={colorScheme}>{children}</ThemeSpring>;
    // case GrowiThemes.WOOD:
    //   return <ThemeWood colorScheme={colorScheme}>{children}</ThemeWood>;
    default:
      return <ThemeDefault>{children}</ThemeDefault>;
  }
};
