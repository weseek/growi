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
 *          args:
 *            type: object
 *            example: { name: 'Josh', age: 20 }
 */

class ErrorV3 extends Error {

  constructor(message = '', code = '', stack = undefined, args = undefined) {
    super(); // do not provide message to the super constructor
    this.message = message;
    this.code = code;
    this.stack = stack;
    this.args = args;
  }

}

module.exports = ErrorV3;
