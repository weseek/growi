module.exports = function(crowi) {
  const mongoose = require('mongoose');
  const editorSettingsSchema = new mongoose.Schema({
    userId: { type: String },
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

  return mongoose.model('EditorSettings', editorSettingsSchema);
};
