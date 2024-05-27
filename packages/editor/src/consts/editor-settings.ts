import type { EditorTheme, KeyMapMode } from '../services';

export interface EditorSettings {
  theme: undefined | EditorTheme,
  keymapMode: undefined | KeyMapMode,
  styleActiveLine: boolean,
  autoFormatMarkdownTable: boolean,
}
