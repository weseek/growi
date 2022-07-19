
import React from 'react';

import dynamic from 'next/dynamic';

export const GrowiThemes = {
  DEFAULT: 'default',
  ANTARCTIC: 'antarctic',
  BLACKBOARD: 'blackboard',
  CHRISTMAS: 'christmas',
  FIRE_RED: 'fire-red',
  FUTURE: 'future',
  HALLOWEEN: 'halloween',
  HUFFLEPUFF: 'hufflepuff',
  ISLAND: 'island',
  JADE_GREEN: 'jade-green',
  KIBELA: 'kibela',
  MONO_BLUE: 'mono-blue',
  NATURE: 'nature',
  SPRING: 'spring',
  WOOD: 'wood',
} as const;
export type GrowiThemes = typeof GrowiThemes[keyof typeof GrowiThemes];


const ThemeAntarctic = dynamic(() => import('../ThemeAntarctic'));
const ThemeBlackboard = dynamic(() => import('../ThemeBlackboard'));
const ThemeChristmas = dynamic(() => import('../ThemeChristmas'));
const ThemeDefault = dynamic(() => import('../ThemeDefault'));


type Props = {
  children: JSX.Element,
  theme: string,
}

export const ThemeProvider = ({ theme, children }: Props): JSX.Element => {
  switch (theme) {
    case GrowiThemes.ANTARCTIC:
      return <ThemeAntarctic>{children}</ThemeAntarctic>;
    case GrowiThemes.BLACKBOARD:
      return <ThemeBlackboard>{children}</ThemeBlackboard>;
    case GrowiThemes.CHRISTMAS:
      return <ThemeChristmas>{children}</ThemeChristmas>;
    default:
      return <ThemeDefault>{children}</ThemeDefault>;
  }
};
