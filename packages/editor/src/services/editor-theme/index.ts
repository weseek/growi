import { Extension } from '@codemirror/state';
import { oneDarkTheme } from '@codemirror/theme-one-dark';
import {
  abcdef,
  abyss,
  androidstudio,
  andromeda,
  atomone,
  aura,
  bbedit,
  basicLight,
  basicDark,
  bespin,
  copilot,
  dracula,
  darcula,
  duotoneLight,
  duotoneDark,
  eclipse,
  githubLight,
  githubDark,
  gruvboxLight,
  gruvboxDark,
  materialLight,
  materialDark,
  monokai,
  monokaiDimmed,
  kimbie,
  noctisLilac,
  nord,
  okaidia,
  quietlight,
  red,
  solarizedLight,
  solarizedDark,
  sublime,
  tokyoNight,
  tokyoNightDay,
  tomorrowNightBlue,
  whiteLight,
  whiteDark,
  vscodeDark,
  xcodeLight,
  xcodeDark,
  material,
} from '@uiw/codemirror-themes-all';
import { basicDark as basicDarkCM6 } from 'cm6-theme-basic-dark';
import { basicLight as basicLightCM6 } from 'cm6-theme-basic-light';
import { gruvboxDark as gruvboxDarkCM6 } from 'cm6-theme-gruvbox-dark';
import { gruvboxLight as gruvboxLightCM6 } from 'cm6-theme-gruvbox-light';
import { materialDark as materialDarkCM6 } from 'cm6-theme-material-dark';
import { nord as nordCM6 } from 'cm6-theme-nord';
import { solarizedDark as solarizedDarkCM6 } from 'cm6-theme-solarized-dark';
import { solarizedLight as solarizedLightCM6 } from 'cm6-theme-solarized-light';
import * as thememirror from 'thememirror';


export const PlaygroundAllEditorTheme: Record<string, Extension> = {
  eclipse,
  elegant: red,
  neo: red,
  'mdn-like': red,
  material,
  dracula,
  monokai,
  twilight: red,
};

export const PlaygroundReactCodeMirror: Record<string, Extension> = {
  abcdef,
  abyss,
  androidstudio,
  andromeda,
  atomone,
  aura,
  bbedit,
  basicLight,
  basicDark,
  bespin,
  copilot,
  dracula,
  darcula,
  duotoneLight,
  duotoneDark,
  eclipse,
  githubLight,
  githubDark,
  gruvboxLight,
  gruvboxDark,
  materialLight,
  materialDark,
  monokai,
  monokaiDimmed,
  kimbie,
  noctisLilac,
  nord,
  okaidia,
  quietlight,
  red,
  solarizedLight,
  solarizedDark,
  sublime,
  tokyoNight,
  tokyoNightDay,
  tomorrowNightBlue,
  whiteLight,
  whiteDark,
  vscodeDark,
  xcodeLight,
  xcodeDark,
};

export const PlaygroundThemeMirror: Record<string, Extension> = {
  'amy-tm': thememirror.amy,
  'ayu light-tm': thememirror.ayuLight,
  'barf-tm': thememirror.barf,
  'bespin-tm': thememirror.bespin,
  'birds of paradise': thememirror.birdsOfParadise,
  'cobalt-tm': thememirror.cobalt,
  'cool glow': thememirror.coolGlow,
  'dracula-tm': thememirror.dracula,
  'espresso-tm': thememirror.espresso,
  'noctis lilac': thememirror.noctisLilac,
  'tomorrow-tm': thememirror.tomorrow,
  'smoothy-tm': thememirror.smoothy,
  "rose' Pine Dawn": thememirror.rosePineDawn,
  'solarized light-tm': thememirror.solarizedLight,
};

export const PlaygroundCM6Themes: Record<string, Extension> = {
  basicLightCM6,
  basicDarkCM6,
  solarizedLightCM6,
  solarizedDarkCM6,
  materialDarkCM6,
  nordCM6,
  gruvboxLightCM6,
  gruvboxDarkCM6,
};

export const PlaygroundOfficial: Record<string, Extension> = {
  oneDarkTheme,
};

export const AllEditorTheme: Record<string, Extension> = {
  ...PlaygroundReactCodeMirror,
  ...PlaygroundThemeMirror,
  ...PlaygroundCM6Themes,
  ...PlaygroundOfficial,
  ...PlaygroundAllEditorTheme,
};
