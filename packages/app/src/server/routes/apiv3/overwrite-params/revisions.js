const mongoose = require('mongoose');

// eslint-disable-next-line no-unused-vars
const ImportOptionForPages = require('~/models/admin/import-option-for-pages');

const { ObjectId } = mongoose.Types;

class RevisionOverwriteParamsFactory {

  /**
   * generate overwrite params object
   * @param {object} user
   * @param {ImportOptionForPages} option
   * @return object
   *  key: property name
   *  value: any value or a function `(value, { document, schema, propertyName }) => { return newValue }`
   */
  static generate(user, option) {
    const params = {};

    if (option.isOverwriteAuthorWithCurrentUser) {
      const userId = ObjectId(user._id);
      params.author = userId;
    }

    return params;
  }

}

module.exports = (user, option) => RevisionOverwriteParamsFactory.generate(user, option);
