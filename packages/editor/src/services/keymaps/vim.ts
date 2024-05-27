import type { Extension } from '@codemirror/state';
import { Vim, vim } from '@replit/codemirror-vim';

// vim useful keymap custom
Vim.map('jj', '<Esc>', 'insert');
Vim.map('jk', '<Esc>', 'insert');

export const vimKeymap = (onSave?: () => void): Extension => {
  if (onSave != null) {
    Vim.defineEx('write', 'w', onSave);
  }
  return vim();
};
