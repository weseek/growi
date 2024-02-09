import { defaultKeymap } from '@codemirror/commands';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { emacs } from '@replit/codemirror-emacs';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';

import { vimKeymap } from './vim';


export const getKeyMap = (keyMapName: KeyMapMode, onSave?: () => void): Extension => {
  switch (keyMapName) {
    case 'vim':
      return vimKeymap(onSave);
    case 'emacs':
      return emacs();
    case 'vscode':
      return keymap.of(vscodeKeymap);
    case 'default':
      return keymap.of(defaultKeymap);
  }
};

const KeyMapMode = {
  default: 'default',
  vim: 'vim',
  emacs: 'emacs',
  vscode: 'vscode',
} as const;

export const AllKeyMap = Object.values(KeyMapMode);
export type KeyMapMode = typeof KeyMapMode[keyof typeof KeyMapMode];
