import { Extension } from '@codemirror/state';

export const getEditorTheme = async(themeName: EditorTheme): Promise<Extension> => {
  switch (themeName) {
    case 'eclipse':
      return (await import('@uiw/codemirror-theme-eclipse')).eclipse;
    case 'basic':
      return (await import('cm6-theme-basic-light')).basicLight;
    case 'ayu':
      return (await import('./ayu')).ayu;
    case 'rosepine':
      return (await import('./rose-pine')).rosePine;
    case 'defaultdark':
      return (await import('./original-dark')).originalDark;
    case 'material':
      return (await import('cm6-theme-material-dark')).materialDark;
    case 'nord':
      return (await import('cm6-theme-nord')).nord;
    case 'cobalt':
      return (await import('./cobalt')).cobalt;
    case 'kimbie':
      return (await import('@uiw/codemirror-theme-kimbie')).kimbie;
  }
  return (await import('./original-light')).originalLight;
};

const EditorTheme = {
  defaultlight: 'defaultlight',
  eclipse: 'eclipse',
  basic: 'basic',
  ayu: 'ayu',
  rosepine:  'rosepine',
  defaultdark: 'defaultdark',
  material: 'material',
  nord: 'nord',
  cobalt: 'cobalt',
  kimbie: 'kimbie',
} as const;

export const AllEditorTheme = Object.values(EditorTheme);
export type EditorTheme = typeof EditorTheme[keyof typeof EditorTheme]
