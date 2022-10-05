const { pagePathUtils } = require('@growi/core');
const mongoose = require('mongoose');

const { isTopPage } = pagePathUtils;

// eslint-disable-next-line no-unused-vars
const ImportOptionForPages = require('~/models/admin/import-option-for-pages');

const { ObjectId } = mongoose.Types;

const {
  GRANT_PUBLIC,
} = mongoose.model('Page');

class PageOverwriteParamsFactory {

  /**
   * generate overwrite params object
   * @param {string} operatorUserId
   * @param {ImportOptionForPages} option
   * @return object
   *  key: property name
   *  value: any value or a function `(value, { document, schema, propertyName }) => { return newValue }`
   */
  static generate(operatorUserId, option) {
    const params = {};

    if (option.isOverwriteAuthorWithCurrentUser) {
      const userId = ObjectId(operatorUserId);
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

    params.parent = (value, { document, schema, propertyName }) => {
      return null;
    };

    params.descendantCount = (value, { document, schema, propertyName }) => {
      return 0;
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

module.exports = (operatorUserId, option) => PageOverwriteParamsFactory.generate(operatorUserId, option);
