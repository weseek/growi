import {
  Schema, Model, Document,
} from 'mongoose';
import { getOrCreateModel } from '../util/mongoose-utils';


export interface ILintRule {
  name: string;
  options?: unknown;
  isEnabled?: boolean;
}

export interface ITextlintSettings {
  isTexlintEnabled: string;
  textlintRules: ILintRule[];
}

export interface IEditorSettings {
  userId: Schema.Types.ObjectId;
  textlintSettings: ITextlintSettings;
}

export interface EditorSettingsDocument extends IEditorSettings, Document {}
export type EditorSettingsModel = Model<EditorSettingsDocument>

const textlintSettingsSchema = new Schema<ITextlintSettings>({
  isTextlintEnabled: { type: Boolean, default: true },
  textlintRules: {
    type: [
      { name: { type: String }, options: { type: Object }, isEnabled: { type: Boolean } },
    ],
  },
});

const editorSettingsSchema = new Schema<IEditorSettings>({
  userId: { type: String },
  textlintSettings: textlintSettingsSchema,
});


export default getOrCreateModel<EditorSettingsDocument, EditorSettingsModel>('EditorSettings', editorSettingsSchema);
