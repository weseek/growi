/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      ErrorV3:
 *        description: Error for APIv3
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            example: 'error message'
 *          code:
 *            type: string
 *            example: 'someapi-error-with-something'
 *          stack:
 *            type: object
 *          i18nArg:
 *            type: object
 *            example: { name: 'Josh', age: 20 }
 */

class ErrorV3 extends Error {

  constructor(message = '', code = '', stack = undefined, i18nArg = undefined) {
    super(); // do not provide message to the super constructor
    this.message = message;
    this.code = code;
    this.stack = stack;
    this.i18nArg = i18nArg;
  }

}

module.exports = ErrorV3;
