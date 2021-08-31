const mongoose = require('mongoose');

module.exports = function(crowi) {

  const editorSettingsSchema = new mongoose.Schema({
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
