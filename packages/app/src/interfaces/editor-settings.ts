export interface ILintRule {
  name: string;
  options?: unknown;
  isEnabled?: boolean;
}

export interface ITextlintSettings {
  isTextlintEnabled: boolean;
  textlintRules: ILintRule[];
}

export interface IEditorSettings {
  theme: undefined | string,
  keymapMode: undefined | 'vim' | 'emacs' | 'sublime',
  styleActiveLine: boolean,
  renderMathJaxInRealtime: boolean,
  renderDrawioInRealtime: boolean,
  textlintSettings: ITextlintSettings;
}
