import type { EditorTheme } from './editor-themes';
import type { KeyMapMode } from './keymaps';

export interface EditorSettings {
  theme: undefined | EditorTheme,
  keymapMode: undefined | KeyMapMode,
  styleActiveLine: boolean,
  autoFormatMarkdownTable: boolean,
}
