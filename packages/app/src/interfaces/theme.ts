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

export const PrismThemes = {
  OneLight: 'one-light',
} as const;
export type PrismThemes = typeof PrismThemes[keyof typeof PrismThemes];
