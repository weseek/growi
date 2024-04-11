import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';


export const getKeymap = async(keyMapName?: KeyMapMode, onSave?: () => void): Promise<Extension> => {
  switch (keyMapName) {
    case 'vim':
      return (await import('./vim')).vimKeymap(onSave);
    case 'emacs':
      return (await import('@replit/codemirror-emacs')).emacs();
    case 'vscode':
      return keymap.of((await import('@replit/codemirror-vscode-keymap')).vscodeKeymap);
  }
  return keymap.of((await import('@codemirror/commands')).defaultKeymap);
};

const KeyMapMode = {
  default: 'default',
  vim: 'vim',
  emacs: 'emacs',
  vscode: 'vscode',
} as const;

export const DEFAULT_KEYMAP = 'default';
export const AllKeyMap = Object.values(KeyMapMode);
export type KeyMapMode = typeof KeyMapMode[keyof typeof KeyMapMode];
