import { GrowiThemeColorSummary, GrowiThemeSchemeType } from '../interfaces/growi-theme-summary';

const { BOTH, LIGHT, DARK } = GrowiThemeSchemeType;

export const PresetThemes = {
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
export type PresetThemes = typeof PresetThemes[keyof typeof PresetThemes];


/* eslint-disable no-multi-spaces */
export const PresetThemesSummaries: GrowiThemeColorSummary[] = [
  // support both of light and dark
  {
    name: PresetThemes.DEFAULT,       schemeType: BOTH, bg: '#ffffff', topbar: '#2a2929', sidebar: '#122c55', theme: '#209fd8',
  }, {
    name: PresetThemes.MONO_BLUE,     schemeType: BOTH, bg: '#F7FBFD', topbar: '#2a2929', sidebar: '#00587A', theme: '#00587A',
  }, {
    name: PresetThemes.HUFFLEPUFF,    schemeType: BOTH, bg: '#EFE2CF', topbar: '#2a2929', sidebar: '#EAAB20', theme: '#993439',
  }, {
    name: PresetThemes.FIRE_RED,      schemeType: BOTH, bg: '#FDFDFD', topbar: '#2c2c2c', sidebar: '#BFBFBF', theme: '#EA5532',
  }, {
    name: PresetThemes.JADE_GREEN,    schemeType: BOTH, bg: '#FDFDFD', topbar: '#2c2c2c', sidebar: '#BFBFBF', theme: '#38B48B',
  },
  // light only
  {
    name: PresetThemes.NATURE,        schemeType: LIGHT, bg: '#f9fff3', topbar: '#234136', sidebar: '#118050', theme: '#460039',
  }, {
    name: PresetThemes.WOOD,          schemeType: LIGHT, bg: '#fffefb', topbar: '#2a2929', sidebar: '#aaa45f', theme: '#aaa45f',
  }, {
    name: PresetThemes.ISLAND,        schemeType: LIGHT, bg: '#cef2ef', topbar: '#2a2929', sidebar: '#0c2a44', theme: 'rgba(183, 226, 219, 1)',
  }, {
    name: PresetThemes.CHRISTMAS,     schemeType: LIGHT, bg: '#fffefb', topbar: '#b3000c', sidebar: '#30882c', theme: '#d3c665',
  }, {
    name: PresetThemes.ANTARCTIC,     schemeType: LIGHT, bg: '#ffffff', topbar: '#2a2929', sidebar: '#000080', theme: '#fa9913',
  }, {
    name: PresetThemes.SPRING,        schemeType: LIGHT, bg: '#ffffff', topbar: '#d3687c', sidebar: '#ffb8c6', theme: '#67a856',
  }, {
    name: PresetThemes.KIBELA,        schemeType: LIGHT, bg: '#f4f5f6', topbar: '#1256a3', sidebar: '#5882fa', theme: '#b5cbf79c',
  },
  // dark only
  {
    name: PresetThemes.FUTURE,       schemeType: DARK, bg: '#16282d', topbar: '#2a2929', sidebar: '#00b5b7', theme: '#00b5b7',
  }, {
    name: PresetThemes.HALLOWEEN,    schemeType: DARK, bg: '#030003', topbar: '#aa4a04', sidebar: '#162b33', theme: '#e9af2b',
  }, {
    name: PresetThemes.BLACKBOARD,   schemeType: DARK, bg: '#223729', topbar: '#563E23', sidebar: '#7B5932', theme: '#DA8506',
  },
];

/* eslint-disable no-multi-spaces */
