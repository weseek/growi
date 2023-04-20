export const DEFAULT_THEME = 'elegant';

const KeyMapMode = {
  default: 'default',
  vim: 'vim',
  emacs: 'emacs',
  sublime: 'sublime',
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
    isUploadableFile: boolean,
    isUploadableImage: boolean,
  }
}
