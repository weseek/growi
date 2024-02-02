import { defaultKeymap } from '@codemirror/commands';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { emacs } from '@replit/codemirror-emacs';
import { Vim, vim } from '@replit/codemirror-vim';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';

// Vim useful keymap custom
Vim.map('jj', '<Esc>', 'insert');
Vim.map('jk', '<Esc>', 'insert');

export const getKeymap = (keymapName: string, onSave?: () => void): Extension => {
  switch (keymapName) {
    case 'vim':
      if (onSave != null) {
        Vim.defineEx('write', 'w', onSave);
      }
      return vim();
    case 'emacs':
      return emacs();
    case 'vscode':
      return keymap.of(vscodeKeymap);
  }
  return keymap.of(defaultKeymap);
};
