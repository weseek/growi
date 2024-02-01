import { defaultKeymap } from '@codemirror/commands';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { emacs } from '@replit/codemirror-emacs';
import { Vim, vim } from '@replit/codemirror-vim';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';

// Vim useful keymap custom
Vim.map('jj', '<Esc>', 'insert');
Vim.map('jk', '<Esc>', 'insert');

export const AllKeymap: Record<string, Extension> = {
  default: keymap.of(defaultKeymap),
  vim: vim(),
  emacs: emacs(),
  vscode: keymap.of(vscodeKeymap),
};
