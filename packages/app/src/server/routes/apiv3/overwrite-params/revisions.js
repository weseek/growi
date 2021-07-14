const mongoose = require('mongoose');

// eslint-disable-next-line no-unused-vars
const ImportOptionForPages = require('@commons/models/admin/import-option-for-pages');

const { ObjectId } = mongoose.Types;

class RevisionOverwriteParamsFactory {

  /**
   * generate overwrite params object
   * @param {object} req
   * @param {ImportOptionForPages} option
   * @return object
   *  key: property name
   *  value: any value or a function `(value, { document, schema, propertyName }) => { return newValue }`
   */
  static generate(req, option) {
    const params = {};

    if (option.isOverwriteAuthorWithCurrentUser) {
      const userId = ObjectId(req.user._id);
      params.author = userId;
    }

    return params;
  }

}

module.exports = (req, option) => RevisionOverwriteParamsFactory.generate(req, option);
