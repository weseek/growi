import { Extension } from '@codemirror/state';

export const getEditorTheme = async(themeName: EditorTheme): Promise<Extension> => {
  switch (themeName) {
    case 'Eclipse':
      return (await import('@uiw/codemirror-theme-eclipse')).eclipse;
    case 'Basic':
      return (await import('cm6-theme-basic-light')).basicLight;
    case 'Ayu':
      return (await import('./ayu')).ayu;
    case 'Rosé Pine':
      return (await import('./rose-pine')).rosePine;
    case 'DefaultDark':
      return (await import('./original-dark')).originalDark;
    case 'Material':
      return (await import('cm6-theme-material-dark')).materialDark;
    case 'Nord':
      return (await import('cm6-theme-nord')).nord;
    case 'Cobalt':
      return (await import('./cobalt')).cobalt;
    case 'Kimbie':
      return (await import('@uiw/codemirror-theme-kimbie')).kimbie;
  }
  return (await import('./original-light')).originalLight;
};

const EditorTheme = {
  DefaultLight: 'DefaultLight',
  Eclipse: 'Eclipse',
  Basic: 'Basic',
  Ayu: 'Ayu',
  'Rosé Pine': 'Rosé Pine',
  DefaultDark: 'DefaultDark',
  Material: 'Material',
  Nord: 'Nord',
  Cobalt: 'Cobalt',
  Kimbie: 'Kimbie',
} as const;


export const AllEditorTheme = Object.values(EditorTheme);
export type EditorTheme = typeof EditorTheme[keyof typeof EditorTheme]
