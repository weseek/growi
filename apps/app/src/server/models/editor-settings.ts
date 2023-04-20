import {
  Schema, Model, Document,
} from 'mongoose';

import { IEditorSettings } from '~/interfaces/editor-settings';

import { getOrCreateModel } from '../util/mongoose-utils';


export interface EditorSettingsDocument extends IEditorSettings, Document {
  userId: Schema.Types.ObjectId,
}
export type EditorSettingsModel = Model<EditorSettingsDocument>

const editorSettingsSchema = new Schema<EditorSettingsDocument, EditorSettingsModel>({
  userId: { type: Schema.Types.ObjectId },
  theme: { type: String },
  keymapMode: { type: String },
  styleActiveLine: { type: Boolean, default: false },
  autoFormatMarkdownTable: { type: Boolean, default: true },
});


export default getOrCreateModel<EditorSettingsDocument, EditorSettingsModel>('EditorSettings', editorSettingsSchema);
