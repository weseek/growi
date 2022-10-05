const { Binary } = require('mongodb');
const { ObjectId } = require('mongoose').Types;

class AttachmentFilesChunksOverwriteParamsFactory {

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

    // Date
    params.files_id = (value, { document, schema, propertyName }) => {
      return ObjectId(value);
    };

    // Binary
    params.data = (value, { document, schema, propertyName }) => {
      return Binary(value);
    };

    return params;
  }

}

module.exports = (req, option) => AttachmentFilesChunksOverwriteParamsFactory.generate(req, option);
