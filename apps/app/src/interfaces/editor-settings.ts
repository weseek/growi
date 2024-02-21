import { type EditorTheme, type KeyMapMode } from '@growi/editor';

export const DEFAULT_KEYMAP = 'default';
export const DEFAULT_THEME = 'defaultlight';

export interface IEditorSettings {
  theme: undefined | EditorTheme,
  keymapMode: undefined | KeyMapMode,
  styleActiveLine: boolean,
  autoFormatMarkdownTable: boolean,
}
