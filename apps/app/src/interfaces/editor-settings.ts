export const DEFAULT_KEYMAP = 'default';
export const DEFAULT_THEME = 'defaultlight';

const KeyMapMode = {
  default: 'default',
  vim: 'vim',
  emacs: 'emacs',
  vscode: 'vscode',
} as const;

export type KeyMapMode = typeof KeyMapMode[keyof typeof KeyMapMode];

const EditorTheme = {
  defaultlight: 'defaultlight',
  eclipse: 'eclipse',
  basic: 'basic',
  ayu: 'ayu',
  rosepine:  'rosepine',
  defaultdark: 'defaultdark',
  material: 'material',
  nord: 'nord',
  cobalt: 'cobalt',
  kimbie: 'kimbie',
} as const;

export type EditorTheme = typeof EditorTheme[keyof typeof EditorTheme];

export interface IEditorSettings {
  theme: undefined | EditorTheme,
  keymapMode: undefined | KeyMapMode,
  styleActiveLine: boolean,
  autoFormatMarkdownTable: boolean,
}

export type EditorConfig = {
  upload: {
    isUploadAllFileAllowed: boolean,
    isUploadEnabled: boolean,
  }
}
