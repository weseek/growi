export const DEFAULT_THEME = 'DefaultLight';

const KeyMapMode = {
  default: 'default',
  vim: 'vim',
  emacs: 'emacs',
  vscode: 'vscode',
} as const;

export type KeyMapMode = typeof KeyMapMode[keyof typeof KeyMapMode];

export interface IEditorSettings {
  theme: undefined | string,
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
