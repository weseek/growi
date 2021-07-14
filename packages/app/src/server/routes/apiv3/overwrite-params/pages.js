const mongoose = require('mongoose');

// eslint-disable-next-line no-unused-vars
const ImportOptionForPages = require('@commons/models/admin/import-option-for-pages');

const { ObjectId } = mongoose.Types;

const {
  GRANT_PUBLIC,
} = mongoose.model('Page');

class PageOverwriteParamsFactory {

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
      params.creator = userId;
      params.lastUpdateUser = userId;
    }

    params.grant = (value, { document, schema, propertyName }) => {
      if (option.makePublicForGrant2 && value === 2) {
        return GRANT_PUBLIC;
      }
      if (option.makePublicForGrant4 && value === 4) {
        return GRANT_PUBLIC;
      }
      if (option.makePublicForGrant5 && value === 5) {
        return GRANT_PUBLIC;
      }
      return value;
    };

    if (option.initPageMetadatas) {
      params.liker = [];
      params.seenUsers = [];
      params.commentCount = 0;
      params.extended = {};
    }

    if (option.initHackmdDatas) {
      params.pageIdOnHackmd = undefined;
      params.revisionHackmdSynced = undefined;
      params.hasDraftOnHackmd = undefined;
    }

    return params;
  }

}

module.exports = (req, option) => PageOverwriteParamsFactory.generate(req, option);
