import { Extension } from '@codemirror/state';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { kimbie } from '@uiw/codemirror-theme-kimbie';
import { basicLight } from 'cm6-theme-basic-light';
import { materialDark as materialDarkCM6 } from 'cm6-theme-material-dark';
import { nord as nordCM6 } from 'cm6-theme-nord';
import { cobalt, ayuLight, rosePineDawn } from 'thememirror';

import { originalDark } from './original-dark';
import { originalLight } from './original-light';


export const AllEditorTheme: Record<string, Extension> = {
  GrowiLight: originalLight,
  eclipse,
  basic: basicLight,
  ayu: ayuLight,
  'rosé pine': rosePineDawn,
  GrowiDark: originalDark,
  material: materialDarkCM6,
  nord: nordCM6,
  cobalt,
  kimbie,
};
