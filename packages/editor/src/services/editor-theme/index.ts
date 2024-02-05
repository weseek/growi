import { Extension } from '@codemirror/state';

export const getEditorTheme = async(themeName: string): Promise<Extension> => {
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

export const AllEditorTheme = ['DefaultLight', 'Eclipse', 'Basic', 'Ayu', 'Rosé Pine', 'DefaultDark', 'Material', 'Nord', 'Cobalt', 'Kimbie'];
