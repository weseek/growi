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

  static set crowi(crowi) {
    this._crowi = crowi;
  }

  static get crowi() {
    return this._crowi;
  }

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
   * @param {object} usernameToBeRegistered the username of User entity that will be created when accountId is not found
   * @returns {Promise<ExternalAccount>}
   * @memberof ExternalAccount
   */
  static findOrRegister(providerType, accountId, usernameToBeRegistered) {

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

          const User = ExternalAccount.crowi.model('User');

          return User.count({username: usernameToBeRegistered})
            .then((count) => {
              // throw Exception when count is not zero
              if (count > 0) {
                throw new DuplicatedUsernameException(`username '${usernameToBeRegistered}' has already been existed`);
              }

              // create user with STATUS_ACTIVE
              return User.createUser('', usernameToBeRegistered, undefined, undefined, undefined, User.STATUS_ACTIVE);
            })
            .then((user) => {
              return this.create({ providerType: 'ldap', accountId, user: user._id });
            });
        }
      });

  }

}

/**
 * The Exception class thrown when User.username is duplicated when creating user
 *
 * @class DuplicatedUsernameException
 */
class DuplicatedUsernameException {
  constructor(message) {
    this.name = this.constructor.name;
    this.message = message;
  }
}

module.exports = function(crowi) {
  ExternalAccount.crowi = crowi;
  schema.loadClass(ExternalAccount);
  return mongoose.model('ExternalAccount', schema);
}
