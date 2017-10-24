const debug = require('debug')('crowi:models:external-account');
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

  /**
   * get the populated user entity
   *
   * @returns Promise<User>
   * @memberof ExternalAccount
   */
  getPopulatedUser() {
    return this.populate('user').execPopulate()
      .then((account) => {
        return account.user;
      })
  }

  /**
   * find an account or register if not found
   *
   * @static
   * @param {string} providerType
   * @param {string} accountId
   * @param {object} createUserFunction the function that create a user document and return Promise<User>
   * @returns {Promise<ExternalAccount>}
   * @memberof ExternalAccount
   */
  static findOrRegister(providerType, accountId, createUserFunction) {

    return this.findOne({ providerType, accountId })
      .then((account) => {
        // found
        if (account != null) {
          debug(`ExternalAccount '${accountId}' is found `, account);
          return account;
        }
        // not found
        else {
          debug(`ExternalAccount '${accountId}' is not found, it is going to be registered.`);

          // TODO count and throw error if username is dupricated

          return createUserFunction().then((user) => {
              return this.create({ providerType: 'ldap', accountId, user: user._id });
            });
        }
      });

  }

}

module.exports = function(crowi) {
  schema.loadClass(ExternalAccount);
  return mongoose.model('ExternalAccount', schema);
}
