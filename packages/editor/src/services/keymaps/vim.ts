import { Extension } from '@codemirror/state';
import { Vim, vim } from '@replit/codemirror-vim';

// vim useful keymap custom
vim.map('jj', '<esc>', 'insert');
vim.map('jk', '<esc>', 'insert');

export const vimKeymap = (onSave?: () => void): Extension => {
  if (onSave != null) {
    Vim.defineEx('write', 'w', onSave);
  }
  return vim();
};
