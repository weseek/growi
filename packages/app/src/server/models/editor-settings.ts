import { getOrCreateModel } from '@growi/core';
import {
  Schema, Model, Document,
} from 'mongoose';


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
  userId: Schema.Types.ObjectId;
  theme: undefined | string,
  keymapMode: undefined | 'vim' | 'emacs' | 'sublime',
  styleActiveLine: boolean,
  renderMathJaxInRealtime: boolean,
  renderDrawioInRealtime: boolean,
  textlintSettings: ITextlintSettings;
}

export interface EditorSettingsDocument extends IEditorSettings, Document {}
export type EditorSettingsModel = Model<EditorSettingsDocument>

const textlintSettingsSchema = new Schema<ITextlintSettings>({
  isTextlintEnabled: { type: Boolean, default: false },
  textlintRules: {
    type: [
      { name: { type: String }, options: { type: Object }, isEnabled: { type: Boolean } },
    ],
  },
});

const editorSettingsSchema = new Schema<EditorSettingsDocument, EditorSettingsModel>({
  userId: { type: Schema.Types.ObjectId },
  theme: { type: String },
  keymapMode: { type: String },
  styleActiveLine: { type: Boolean, default: false },
  renderMathJaxInRealtime: { type: Boolean, default: true },
  renderDrawioInRealtime: { type: Boolean, default: true },
  textlintSettings: textlintSettingsSchema,
});


export default getOrCreateModel<EditorSettingsDocument, EditorSettingsModel>('EditorSettings', editorSettingsSchema);
