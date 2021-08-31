import { Schema } from 'mongoose';
import { getOrCreateModel } from '../util/mongoose-utils';

const editorSettingsSchema = new Schema({
  isTextlintEnabled: { type: Boolean, default: true },
  commonTextlintRules: {
    type: [
      { name: { type: String }, options: { type: Object }, isEnabled: { type: Boolean } },
    ],
  },
  japaneseTextlintRules: {
    type: [
      { name: { type: String }, options: { type: Object }, isEnabled: { type: Boolean } },
    ],
  },
});


export default getOrCreateModel('EditorSettings', editorSettingsSchema);
