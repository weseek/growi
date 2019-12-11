class ErrorV3 extends Error {

  constructor(message = '', code = '', stack = undefined) {
    super(); // do not provide message to the super constructor
    this.message = message;
    this.code = code;
    this.stack = stack;
  }

}

module.exports = ErrorV3;
