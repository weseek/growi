import { Extension } from '@codemirror/state';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { kimbie } from '@uiw/codemirror-theme-kimbie';
import { basicLight } from 'cm6-theme-basic-light';
import { materialDark as materialDarkCM6 } from 'cm6-theme-material-dark';
import { nord as nordCM6 } from 'cm6-theme-nord';

import { ayu } from './ayu';
import { cobalt } from './cobalt';
import { originalDark } from './original-dark';
import { originalLight } from './original-light';
import { rosePine } from './rose-pine';


export const AllEditorTheme: Record<string, Extension> = {
  DefaultLight: originalLight,
  Eclipse: eclipse,
  Basic: basicLight,
  Ayu: ayu,
  'Rosé Pine': rosePine,
  DefaultDark: originalDark,
  Material: materialDarkCM6,
  Nord: nordCM6,
  Cobalt: cobalt,
  Kimbie: kimbie,
};
