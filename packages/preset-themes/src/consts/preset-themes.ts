import { GrowiThemeMetadata, GrowiThemeSchemeType } from '../interfaces/growi-theme-metadata';

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
  CLASSIC: 'classic',
} as const;
export type PresetThemes = typeof PresetThemes[keyof typeof PresetThemes];

/* eslint-disable no-multi-spaces, */

export const DefaultThemeMetadata: GrowiThemeMetadata = {
  name: PresetThemes.DEFAULT,
  manifestKey: `src/styles/${PresetThemes.DEFAULT}.scss`,
  schemeType: BOTH,
  bg: '#ffffff',
  topbar: '#2a2929',
  sidebar: '#122c55',
  createBtn: '#007EB0',
  isPresetTheme: true,
};

export const PresetThemesMetadatas: GrowiThemeMetadata[] = [
  // support both of light and dark
  DefaultThemeMetadata,
  {
    name: PresetThemes.MONO_BLUE,     schemeType: BOTH, bg: '#F7FBFD', topbar: '#2a2929', sidebar: '#00587A', createBtn: '#439CB9',
  }, {
    name: PresetThemes.HUFFLEPUFF,    schemeType: BOTH, bg: '#EFE2CF', topbar: '#2a2929', sidebar: '#EAAB20', createBtn: '#403C39',
  }, {
    name: PresetThemes.FIRE_RED,      schemeType: BOTH, bg: '#FDFDFD', topbar: '#2c2c2c', sidebar: '#BFBFBF', createBtn: '#EA5532',
  }, {
    name: PresetThemes.JADE_GREEN,    schemeType: BOTH, bg: '#FDFDFD', topbar: '#2c2c2c', sidebar: '#BFBFBF', createBtn: '#49B38A',
  }, {
    name: PresetThemes.CLASSIC,    schemeType: BOTH, bg: '#FDFDFD', topbar: '#E1E9F4', sidebar: '#E1E9F4', createBtn: '#3491CB',
  },
  // light only
  {
    name: PresetThemes.NATURE,        schemeType: LIGHT, bg: '#f9fff3', topbar: '#234136', sidebar: '#118050', createBtn: '#4FA529',
  }, {
    name: PresetThemes.WOOD,          schemeType: LIGHT, bg: '#fffefb', topbar: '#2a2929', sidebar: '#aaa45f', createBtn: '#A77E21',
  }, {
    name: PresetThemes.ISLAND,        schemeType: LIGHT, bg: '#cef2ef', topbar: '#2a2929', sidebar: '#0c2a44', createBtn: '#51C2D3',
  }, {
    name: PresetThemes.CHRISTMAS,     schemeType: LIGHT, bg: '#fffefb', topbar: '#b3000c', sidebar: '#30882c', createBtn: '#B90606',
  }, {
    name: PresetThemes.ANTARCTIC,     schemeType: LIGHT, bg: '#ffffff', topbar: '#2a2929', sidebar: '#000080', createBtn: '#303DDB',
  }, {
    name: PresetThemes.SPRING,        schemeType: LIGHT, bg: '#ffffff', topbar: '#d3687c', sidebar: '#ffb8c6', createBtn: '#6ABA55',
  }, {
    name: PresetThemes.KIBELA,        schemeType: LIGHT, bg: '#f4f5f6', topbar: '#1256a3', sidebar: '#5882fa', createBtn: '#3080C0',
  },
  // dark only
  {
    name: PresetThemes.FUTURE,        schemeType: DARK, bg: '#16282d', topbar: '#2a2929', sidebar: '#00b5b7', createBtn: '#03A2A8',
  }, {
    name: PresetThemes.HALLOWEEN,     schemeType: DARK, bg: '#030003', topbar: '#aa4a04', sidebar: '#162b33', createBtn: '#AA4A04',
  }, {
    name: PresetThemes.BLACKBOARD,    schemeType: DARK, bg: '#223729', topbar: '#563E23', sidebar: '#7B5932', createBtn: '#BA840A',
  },
]
  // fill in missing information
  .map((metadata) => {
    return {
      ...metadata,
      isPresetTheme: true,
      manifestKey: `src/styles/${metadata.name}.scss`,
    };
  });
/* eslint-disable no-multi-spaces */
