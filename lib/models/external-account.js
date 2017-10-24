const debug = require('debug')('crowi.models.external-account');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const ObjectId = mongoose.Schema.Types.ObjectId;

/*
 * define schema
 */
const schema = new mongoose.Schema({
  providerType: { type: String, required: true },
  accountId: { type: String, required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});
// compound index
schema.index({ providerType: 1, accountId: 1 });
// apply plugins
schema.plugin(uniqueValidator);

/**
 * ExternalAccount Class
 *
 * @class ExternalAccount
 */
class ExternalAccount {
}

module.exports = function(crowi) {
  schema.loadClass(ExternalAccount);
  return mongoose.model('ExternalAccount', schema);
}
