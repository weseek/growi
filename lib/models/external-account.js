const debug = require('debug')('crowi:models:external-account');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
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
schema.index({ providerType: 1, accountId: 1}, { unique: true });
// apply plugins
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

/**
 * ExternalAccount Class
 *
 * @class ExternalAccount
 */
class ExternalAccount {

  /**
   * limit items num for pagination
   *
   * @readonly
   * @static
   * @memberof ExternalAccount
   */
  static get DEFAULT_LIMIT() {
    return 50;
  }

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

  /**
   * find all entities with pagination
   *
   * @see https://github.com/edwardhotchkiss/mongoose-paginate
   *
   * @static
   * @param {any} opts mongoose-paginate options object
   * @returns {Promise<any>} mongoose-paginate result object
   * @memberof ExternalAccount
   */
  static findAllWithPagination(opts) {
    const query = {};
    const options = Object.assign({ populate: 'user' }, opts);
    if (options.sort == null) {
      options.sort = {accountId: 1, createdAt: 1};
    }
    if (options.limit == null) {
      options.limit = ExternalAccount.DEFAULT_LIMIT;
    }

    return this.paginate(query, options)
      .catch((err) => {
        debug('Error on pagination:', err);
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
