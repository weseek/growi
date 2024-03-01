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
  lightBg: '#FFFFFF',
  darkBg: '#1C1A1A',
  lightSidebar: '#F8F7F7',
  darkSidebar: '#434240',
  createBtn: '#007EB0',
  isPresetTheme: true,
};

export const PresetThemesMetadatas: GrowiThemeMetadata[] = [
  // support both of light and dark
  DefaultThemeMetadata,
  {
    name: PresetThemes.MONO_BLUE,
    schemeType: BOTH,
    lightBg: '#FFFFFF',
    darkBg: '#16202C',
    lightSidebar: '#EDFAFD',
    darkSidebar: '#0A2E53',
    createBtn: '#439CB9',
  }, {
    name: PresetThemes.HUFFLEPUFF,
    schemeType: BOTH,
    lightBg: '#26231E',
    darkBg: '#16202C',
    lightSidebar: '#FEEBA5',
    darkSidebar: '#5C4209',
    createBtn: '#403C39',
  }, {
    name: PresetThemes.FIRE_RED,
    schemeType: BOTH,
    lightBg: '#FFFFFF',
    darkBg: '#120700',
    lightSidebar: '#FADDD6',
    darkSidebar: '#5A4F4A',
    createBtn: '#EA5532',
  }, {
    name: PresetThemes.JADE_GREEN,
    schemeType: BOTH,
    lightBg: '#FFFFFF',
    darkBg: '#120700',
    lightSidebar: '#F1F3F2',
    darkSidebar: '#4B4E4C',
    createBtn: '#49B38A',
  }, {
    name: PresetThemes.CLASSIC,
    schemeType: BOTH,
    lightBg: '#FFFFFF',
    darkBg: '#151A1F',
    lightSidebar: '#F0F4FA',
    darkSidebar: '#29343F',
    createBtn: '#3491CB',
  },
  // light only
  {
    name: PresetThemes.NATURE,
    schemeType: LIGHT,
    lightBg: '#FFFFFF',
    darkBg: '#FAF9F8',
    lightSidebar: '#EBF9CC',
    darkSidebar: '#D8F399',
    createBtn: '#4FA529',
  }, {
    name: PresetThemes.WOOD,
    schemeType: LIGHT,
    lightBg: '#FFFFF5',
    darkBg: '#FDFAF0',
    lightSidebar: '#EAE3D4',
    darkSidebar: '#DCCBA6',
    createBtn: '#A77E21',
  }, {
    name: PresetThemes.ISLAND,
    schemeType: LIGHT,
    lightBg: '#FFFFFF',
    darkBg: '#E8F7FA',
    lightSidebar: '#F3EEE0',
    darkSidebar: '#E8DDC0',
    createBtn: '#51C2D3',
  }, {
    name: PresetThemes.CHRISTMAS,
    schemeType: LIGHT,
    lightBg: '#212836',
    darkBg: '#323D52',
    lightSidebar: '#2E3E27',
    darkSidebar: '#455D3B',
    createBtn: '#B90606',
  }, {
    name: PresetThemes.ANTARCTIC,
    schemeType: LIGHT,
    lightBg: '#FAFEFF',
    darkBg: '#E5FAFF',
    lightSidebar: '#EDF4FC',
    darkSidebar: '#DBE9F9',
    createBtn: '#303DDB',
  }, {
    name: PresetThemes.SPRING,
    schemeType: LIGHT,
    lightBg: '#FFFFFF',
    darkBg: '#FFFDF5',
    lightSidebar: '#FEE7EB',
    darkSidebar: '#F9CED7',
    createBtn: '#6ABA55',
  }, {
    name: PresetThemes.KIBELA,
    schemeType: LIGHT,
    lightBg: '#FFFFFF',
    darkBg: '#F5F5F5',
    lightSidebar: '#FFFFFF',
    darkSidebar: '#F5F5F5',
    createBtn: '#3080C0',
  },
  // dark only
  {
    name: PresetThemes.FUTURE,
    schemeType: DARK,
    lightBg: '#092627',
    darkBg: '#1F4C4D',
    lightSidebar: '#2a2929',
    darkSidebar: '#27413D',
    createBtn: '#03A2A8',
  }, {
    name: PresetThemes.HALLOWEEN,
    schemeType: DARK,
    lightBg: '#240E3E',
    darkBg: '#2F1155',
    lightSidebar: '#2F1155',
    darkSidebar: '#3B136C',
    createBtn: '#AA4A04',
  }, {
    name: PresetThemes.BLACKBOARD,
    schemeType: DARK,
    lightBg: '#223323',
    darkBg: '#213E23',
    lightSidebar: '#1B431C',
    darkSidebar: '#29652B',
    createBtn: '#BA840A',
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
