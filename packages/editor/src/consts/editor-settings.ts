import { EditorTheme, KeyMapMode } from '../services';

export interface IEditorSettings {
  theme: undefined | EditorTheme,
  keymapMode: undefined | KeyMapMode,
  styleActiveLine: boolean,
  autoFormatMarkdownTable: boolean,
}
