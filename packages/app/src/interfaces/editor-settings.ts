export interface ILintRule {
  name: string;
  options?: unknown;
  isEnabled?: boolean;
}

export interface ITextlintSettings {
  neverAskBeforeDownloadLargeFiles: boolean;
  textlintRules: ILintRule[];
}

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
  renderMathJaxInRealtime: boolean,
  renderDrawioInRealtime: boolean,
  autoFormatMarkdownTable: boolean,
  textlintSettings: undefined | ITextlintSettings;
}

export type EditorConfig = {
  upload: {
    image: any,
    file: any,
  }
}
